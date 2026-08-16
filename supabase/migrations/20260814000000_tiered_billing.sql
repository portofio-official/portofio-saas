-- 20260814000000_tiered_billing.sql
-- billing-002: tiered subscription plans (Basic / Premium / Enterprise), monthly + annual.
-- Adds the `plans` catalog, plan-aware `subscriptions` columns, per-template `minimum_plan`,
-- and a plan-based `entitlements` resolver. PRD v1.9 §7.6, §9.4, §10.
--
-- Prices below are SNAPSHOTS/placeholders (PRD §10: "Harga final masih perlu validasi").
-- They are stored so webhooks, audit, and price changes stay traceable. Update this seed
-- (or via Admin later) once final pricing is decided.
--
-- Idempotent: safe to re-run (dev sandbox) and to apply on top of the shipped schema.

-- 1. plans catalog ---------------------------------------------------------
create table if not exists public.plans (
  id text primary key,                            -- e.g. 'basic-monthly'
  tier text not null check (tier in ('basic', 'premium', 'enterprise')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  name text not null,
  price_idr integer not null check (price_idr > 0),
  midtrans_product_id text not null,              -- item id sent to Midtrans Snap
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tier, billing_cycle)
);

comment on table public.plans is
  'Billable plan catalog. Each (tier, billing cycle) pair maps to one Midtrans product.';

insert into public.plans (id, tier, billing_cycle, name, price_idr, midtrans_product_id)
values
  ('basic-monthly',   'basic',      'monthly', 'Basic',     49000,  'portofio-basic-monthly'),
  ('basic-annual',    'basic',      'annual',  'Basic',     490000, 'portofio-basic-annual'),
  ('premium-monthly', 'premium',    'monthly', 'Premium',   99000,  'portofio-premium-monthly'),
  ('premium-annual',  'premium',    'annual',  'Premium',   990000, 'portofio-premium-annual'),
  ('enterprise-monthly', 'enterprise', 'monthly', 'Enterprise', 199000,  'portofio-enterprise-monthly'),
  ('enterprise-annual',  'enterprise', 'annual',  'Enterprise', 1990000, 'portofio-enterprise-annual')
on conflict (id) do update set
  name = excluded.name,
  price_idr = excluded.price_idr,
  midtrans_product_id = excluded.midtrans_product_id;

-- keep plans.updated_at fresh when the catalog is edited
create or replace function public.set_plans_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists plans_touch_updated_at on public.plans;
create trigger plans_touch_updated_at
  before update on public.plans
  for each row execute function public.set_plans_updated_at();

alter table public.plans enable row level security;

create policy "plans_read_anyone"
  on public.plans
  for select
  to anon, authenticated
  using (true);

-- 2. subscriptions: plan-aware columns -------------------------------------
alter table public.subscriptions
  add column if not exists plan_id text references public.plans(id),
  add column if not exists billing_cycle text check (billing_cycle in ('monthly', 'annual')),
  add column if not exists plan_snapshot jsonb,   -- tier/name/price snapshot at purchase time
  add column if not exists current_period_start timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists provider_order_id text,      -- Midtrans order id
  add column if not exists provider_transaction_id text; -- Midtrans transaction id

create index if not exists subscriptions_plan_id_idx on public.subscriptions(plan_id);

-- Backfill pre-tiered subscriptions: existing active rows get the Basic monthly plan.
update public.subscriptions s
  set plan_id = 'basic-monthly',
      billing_cycle = 'monthly',
      plan_snapshot = jsonb_build_object(
        'tier', 'basic',
        'name', 'Basic',
        'billing_cycle', 'monthly',
        'price_idr', 49000
      ),
      current_period_start = s.created_at
  where s.plan_id is null and s.status = 'active';

-- 3. templates: per-template minimum plan -----------------------------------
alter table public.templates
  add column if not exists minimum_plan text not null default 'basic'
    check (minimum_plan in ('basic', 'premium', 'enterprise'));

-- all 8 currently-registered built-in templates are Basic-accessible by default
update public.templates set minimum_plan = 'basic' where minimum_plan is null;

-- 4. entitlements resolver --------------------------------------------------
create table if not exists public.entitlements (
  tier text primary key check (tier in ('basic', 'premium', 'enterprise')),
  max_live_websites integer not null default 1,
  publish_subdomain boolean not null default false,
  custom_domain boolean not null default false,
  watermark boolean not null default true,
  advanced_analytics boolean not null default false,
  priority_support boolean not null default false,
  premium_templates boolean not null default false
);

comment on table public.entitlements is
  'Server-side entitlement flags per plan tier. Enforcement must never trust client values.';

insert into public.entitlements (tier, max_live_websites, publish_subdomain, custom_domain, watermark, advanced_analytics, priority_support, premium_templates)
values
  ('basic',      1, true,  false, true,  false, false, false),
  ('premium',    1, true,  true,  false, true,  true,  true),
  ('enterprise', 1, true,  true,  false, true,  true,  true)
on conflict (tier) do update set
  max_live_websites = excluded.max_live_websites,
  publish_subdomain = excluded.publish_subdomain,
  custom_domain = excluded.custom_domain,
  watermark = excluded.watermark,
  advanced_analytics = excluded.advanced_analytics,
  priority_support = excluded.priority_support,
  premium_templates = excluded.premium_templates;

alter table public.entitlements enable row level security;

create policy "entitlements_read_authenticated"
  on public.entitlements
  for select
  to authenticated
  using (true);

-- Single server-side source of truth: resolves the caller's (or a given user's)
-- entitlements from their active / grace-period subscription. Returns zero rows
-- for free accounts (no publish). Security invoker so RLS still scopes reads.
create or replace function public.get_user_entitlements(target_user_id uuid default auth.uid())
returns table (
  tier text,
  max_live_websites integer,
  publish_subdomain boolean,
  custom_domain boolean,
  watermark boolean,
  advanced_analytics boolean,
  priority_support boolean,
  premium_templates boolean
)
language sql
stable
security invoker
as $$
  select e.tier, e.max_live_websites, e.publish_subdomain, e.custom_domain,
         e.watermark, e.advanced_analytics, e.priority_support, e.premium_templates
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  join public.entitlements e on e.tier = p.tier
  where s.user_id = target_user_id
    and s.status in ('active', 'grace_period')
  limit 1;
$$;
