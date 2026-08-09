-- Visitor analytics (D-5, Sprint 4.3 — Fase 2). One row per page view of a
-- published portfolio site. Data is denormalized from request headers at
-- insert time (no PII stored: hashed/anonymous visitor id, referrer host,
-- device/browser classification, country code).
--
-- Apply after content-library + midtrans migrations:
--   20260810000002_content_library_global.sql
--   20260810000003_midtrans_billing.sql

create table if not exists public.page_visits (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  subdomain      text not null,
  page_path      text not null default '/',
  visitor_hash   text,                      -- opaque id from the visitor's session (no PII)
  referrer_host  text,                      -- origin host only (never full URL)
  device_type    text not null default 'other',  -- desktop|mobile|tablet|bot|other
  browser        text,                      -- Edge|Chrome|Firefox|Safari|Opera|...|null
  country_code   text,                      -- ISO 3166-1 alpha-2 from edge headers
  created_at     timestamptz not null default now()
);

create index if not exists page_visits_project_created_idx
  on public.page_visits(project_id, created_at desc);
create index if not exists page_visits_project_visitor_idx
  on public.page_visits(project_id, visitor_hash);

alter table public.page_visits enable row level security;

-- Public beacon: anyone (anon or authenticated) can record a visit for a
-- *published* project only. This keeps the tracking endpoint safe from being
-- used to spam unrelated projects.
create policy "page_visits_public_insert" on public.page_visits
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

-- Dashboard reads: the owning account (via workspace -> project) can read,
-- and delete (cleanup) its own visits.
create policy "page_visits_owner_all" on public.page_visits
  for all to authenticated
  using (
    exists (
      select 1 from public.projects p
      join public.workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      join public.workspaces w on w.id = p.workspace_id
      where p.id = project_id and w.user_id = auth.uid()
    )
  );