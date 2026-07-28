-- Migration: Add project_versions table and evolve projects data model
-- Replaces projects.draft_json and projects.published_json with versioned rows in project_versions.

-- 1. Create project_versions table
create table if not exists public.project_versions (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  version_number   integer not null,
  content_json     jsonb not null,
  schema_version   integer not null default 1,
  is_autosave      boolean not null default true,
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id) on delete set null
);

create unique index if not exists project_versions_project_version_idx
  on public.project_versions(project_id, version_number);

create index if not exists project_versions_project_id_idx
  on public.project_versions(project_id);

-- 2. Add version pointers to projects table
alter table public.projects
  add column if not exists current_version_id uuid references public.project_versions(id) on delete set null,
  add column if not exists published_version_id uuid references public.project_versions(id) on delete set null;

-- 3. Data Migration: Migrate draft_json & published_json into project_versions rows
do $$
declare
  r record;
  v_draft_version_id uuid;
  v_pub_version_id uuid;
begin
  -- Only execute data migration if draft_json column still exists
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'projects' and column_name = 'draft_json'
  ) then
    for r in select id, template_version, draft_json, published_json, created_at, published_at from public.projects loop
      -- Create initial draft version (version 1)
      v_draft_version_id := gen_random_uuid();
      insert into public.project_versions (id, project_id, version_number, content_json, schema_version, is_autosave, created_at)
      values (v_draft_version_id, r.id, 1, r.draft_json, r.template_version, false, r.created_at);
      
      -- Update current_version_id
      update public.projects set current_version_id = v_draft_version_id where id = r.id;

      -- If published_json is present, create published version (version 2)
      if r.published_json is not null then
        v_pub_version_id := gen_random_uuid();
        insert into public.project_versions (id, project_id, version_number, content_json, schema_version, is_autosave, created_at)
        values (v_pub_version_id, r.id, 2, r.published_json, r.template_version, false, coalesce(r.published_at, r.created_at));

        update public.projects set published_version_id = v_pub_version_id where id = r.id;
      end if;
    end loop;

    -- Drop legacy jsonb columns from projects
    alter table public.projects drop column draft_json;
    alter table public.projects drop column published_json;
  end if;
end $$;

-- 4. Enable RLS on project_versions
alter table public.project_versions enable row level security;

drop policy if exists "project_versions_owner_all" on public.project_versions;
create policy "project_versions_owner_all" on public.project_versions
  for all to authenticated
  using (exists (
    select 1 from public.projects p
    join public.workspaces w on w.id = p.workspace_id
    where p.id = project_versions.project_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.projects p
    join public.workspaces w on w.id = p.workspace_id
    where p.id = project_versions.project_id and w.user_id = auth.uid()
  ));

drop policy if exists "project_versions_public_read_published" on public.project_versions;
create policy "project_versions_public_read_published" on public.project_versions
  for select to anon
  using (exists (
    select 1 from public.projects p
    where p.id = project_versions.project_id
      and p.published_version_id = project_versions.id
      and p.status = 'published'
  ));

-- 5. Update publish_project RPC function to swap pointers atomically
create or replace function public.publish_project(
  p_project_id uuid,
  p_subdomain   text
) returns void
language plpgsql
security definer
as $$
declare
  v_workspace_id uuid;
begin
  select workspace_id into v_workspace_id
  from public.projects
  where id = p_project_id;

  if not exists (
    select 1 from public.workspaces
    where id = v_workspace_id and user_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  update public.projects
  set
    published_version_id = current_version_id,
    subdomain            = p_subdomain,
    status               = 'published',
    published_at         = now(),
    updated_at           = now()
  where id = p_project_id;
end;
$$;
