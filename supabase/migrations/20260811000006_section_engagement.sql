-- Section engagement (Sprint-2 SP2-031). One row per section a visitor reached on a
-- published portfolio site. The public beacon's IntersectionObserver sends a capped
-- set of section events per visit (each section at most once per visitor session).
--
-- Apply after 20260810000004_visitor_analytics.sql. No PII stored (opaque visitor
-- hash, short section key/label, no full scroll data).

create table if not exists public.section_visits (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  subdomain      text not null,
  section_key    text not null,
  section_label  text,                      -- friendly heading label captured at the beacon
  page_path      text not null default '/',
  visitor_hash   text,                          -- opaque id from the visitor's session
  device_type    text not null default 'other', -- desktop|mobile|tablet|bot|other
  created_at     timestamptz not null default now()
);

create index if not exists section_visits_project_created_idx
  on public.section_visits(project_id, created_at desc);
create index if not exists section_visits_project_visitor_idx
  on public.section_visits(project_id, visitor_hash);

alter table public.section_visits enable row level security;

-- Public beacon: anyone (anon or authenticated) can record a section for a
-- *published* project only — same guard as page_visits.
create policy "section_visits_public_insert" on public.section_visits
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

-- Dashboard reads: the owning account (via workspace -> project) can read and
-- delete (cleanup) its own section engagement rows.
create policy "section_visits_owner_all" on public.section_visits
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