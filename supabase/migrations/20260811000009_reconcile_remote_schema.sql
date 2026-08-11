-- Reconcile schema drift found in the remote Supabase project.
-- This migration is idempotent and safe to apply after the existing migrations.

-- 1. Built-in template catalog used by public/dashboard galleries and Admin.
create table if not exists public.templates (
  id text primary key,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

drop policy if exists "templates_public_select" on public.templates;
create policy "templates_public_select"
  on public.templates
  for select
  to anon, authenticated
  using (true);

drop policy if exists "templates_admin_update" on public.templates;
create policy "templates_admin_update"
  on public.templates
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.templates (id, name, is_active) values
  ('minimal', 'Minimal', true),
  ('bold', 'Bold', true),
  ('creative', 'Creative', true),
  ('corporate', 'Corporate', true),
  ('dark', 'Dark', true),
  ('studio', 'Studio', true),
  ('portfolio-pro', 'Portfolio Pro', true),
  ('freelancer', 'Freelancer', true)
on conflict (id) do update
set name = excluded.name;

-- 2. Section engagement table consumed by /api/track and analytics/store.ts.
create table if not exists public.section_visits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  subdomain text not null,
  section_key text not null,
  section_label text,
  page_path text not null default '/',
  visitor_hash text,
  device_type text not null default 'other',
  created_at timestamptz not null default now()
);

create index if not exists section_visits_project_created_idx
  on public.section_visits(project_id, created_at desc);
create index if not exists section_visits_project_visitor_idx
  on public.section_visits(project_id, visitor_hash);

alter table public.section_visits enable row level security;

drop policy if exists "section_visits_public_insert" on public.section_visits;
create policy "section_visits_public_insert"
  on public.section_visits
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.status = 'published'
    )
  );

drop policy if exists "section_visits_owner_all" on public.section_visits;
create policy "section_visits_owner_all"
  on public.section_visits
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      join public.workspaces w on w.id = p.workspace_id
      where p.id = section_visits.project_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      join public.workspaces w on w.id = p.workspace_id
      where p.id = section_visits.project_id
        and w.user_id = auth.uid()
    )
  );

-- 3. Midtrans webhook idempotency key. Older remote schema still used the
-- provider-specific Xendit column name.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_events'
      and column_name = 'xendit_event_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_events'
      and column_name = 'provider_event_id'
  ) then
    alter table public.billing_events rename column xendit_event_id to provider_event_id;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_events'
      and column_name = 'provider_event_id'
  ) then
    alter table public.billing_events add column provider_event_id text;
    update public.billing_events
    set provider_event_id = id::text
    where provider_event_id is null;
    alter table public.billing_events alter column provider_event_id set not null;
  end if;
end $$;

create unique index if not exists billing_events_provider_event_id_idx
  on public.billing_events(provider_event_id);

comment on column public.billing_events.provider_event_id is
  'Unique payment-provider event or transaction identifier used for webhook idempotency.';
