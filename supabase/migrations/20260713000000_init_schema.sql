-- Portofyo initial schema (PRD 9.4, workspace model v1.3).
-- auth.users is provided by Supabase Auth — no users table of our own.
--
-- Deliberately NOT created here:
--   - `templates`: template catalog (name, thumbnail, renderer) lives in code
--     at src/lib/templates/registry.tsx, same pattern template-001/002 already
--     ship. No DB table until something needs to query it dynamically.
--   - `projects` as its own table: the PortfolioData contract (PRD 9.4) embeds
--     `projects` as an array field, and the app already reads/writes the whole
--     object as one unit (src/lib/portfolio/store.ts). Storing it as one jsonb
--     column matches the existing code exactly; normalize later if a feature
--     needs to query/filter individual projects.

create extension if not exists pgcrypto;

-- workspaces: one account -> many workspaces, each its own brand/portfolio.
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists workspaces_user_id_idx on public.workspaces(user_id);

alter table public.workspaces enable row level security;

create policy "workspaces_owner_all" on public.workspaces
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- portfolio_data: one row per workspace, the whole PortfolioData contract as jsonb.
create table if not exists public.portfolio_data (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_data enable row level security;

create policy "portfolio_data_owner_all" on public.portfolio_data
  for all
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = auth.uid()));

-- sites: one row per workspace (a workspace has exactly one site).
create table if not exists public.sites (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  subdomain text not null unique,
  template_id text not null default 'minimal'
    check (template_id in ('minimal', 'bold', 'creative', 'corporate', 'dark')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.sites enable row level security;

create policy "sites_owner_all" on public.sites
  for all
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = auth.uid()));

-- Published sites are rendered for anonymous visitors on their subdomain
-- (PRD 7.4/9.3), so anon needs read access scoped to published rows only —
-- and, transitively, to the workspace/portfolio_data those rows point at.
create policy "sites_public_read_published" on public.sites
  for select to anon
  using (status = 'published');

create policy "workspaces_public_read_published" on public.workspaces
  for select to anon
  using (exists (select 1 from public.sites s where s.workspace_id = workspaces.id and s.status = 'published'));

create policy "portfolio_data_public_read_published" on public.portfolio_data
  for select to anon
  using (exists (select 1 from public.sites s where s.workspace_id = portfolio_data.workspace_id and s.status = 'published'));

-- subscriptions: per-account billing status (PRD 7.6, single plan).
-- Users may only READ their own row; only the server (service_role, which
-- bypasses RLS — e.g. a Xendit webhook handler) writes status changes.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'inactive'
    check (status in ('inactive', 'active', 'past_due', 'canceled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions_owner_read" on public.subscriptions
  for select
  using (user_id = auth.uid());
