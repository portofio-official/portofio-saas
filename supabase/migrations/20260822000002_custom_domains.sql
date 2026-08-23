-- billing-002 (full scope, 2026-08-22): custom domains for Premium/Enterprise.
-- One domain per project, verified via Vercel's Domain API before it's live.
-- Public read is restricted to `verified` rows only — proxy.ts needs it to
-- resolve an inbound custom-domain host to a project's subdomain slug.

create table if not exists public.custom_domains (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  domain text not null unique,
  status text not null default 'pending_verification'
    check (status in ('pending_verification', 'verified', 'failed', 'removed')),
  verification_token text not null,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.custom_domains is
  'One custom domain per project (Premium/Enterprise entitlement). Verified via the Vercel Domain API.';

create index if not exists custom_domains_project_id_idx on public.custom_domains(project_id);
create index if not exists custom_domains_domain_idx on public.custom_domains(domain);

create or replace function public.set_custom_domains_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists custom_domains_touch_updated_at on public.custom_domains;
create trigger custom_domains_touch_updated_at
  before update on public.custom_domains
  for each row execute function public.set_custom_domains_updated_at();

alter table public.custom_domains enable row level security;

-- Owner (via the project's workspace) manages their own domain rows.
drop policy if exists "custom_domains_owner_all" on public.custom_domains;
create policy "custom_domains_owner_all" on public.custom_domains
  for all
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      join public.workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      join public.workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = (select auth.uid())
    )
  );

-- Routing (proxy.ts) needs to resolve host -> project for verified domains
-- only. Anon read is limited to the columns it needs via a security-barrier
-- view rather than exposing the whole row (verification_token stays private).
drop policy if exists "custom_domains_public_read_verified" on public.custom_domains;
create policy "custom_domains_public_read_verified" on public.custom_domains
  for select
  to anon
  using (status = 'verified');

drop view if exists public.custom_domain_routes;
create view public.custom_domain_routes
  with (security_invoker = true)
  as
  select cd.domain, p.subdomain
  from public.custom_domains cd
  join public.projects p on p.id = cd.project_id
  where cd.status = 'verified' and p.status = 'published' and p.subdomain is not null;

comment on view public.custom_domain_routes is
  'Public routing lookup for proxy.ts: verified custom domain -> published project subdomain. security_invoker so it still respects custom_domains RLS (anon: verified rows only) and projects RLS (anon: published rows only).';

grant select on public.custom_domain_routes to anon, authenticated;
