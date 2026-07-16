-- projects: banyak website per workspace (many:1).
-- Menggantikan sites (1:1). Tabel sites TIDAK dihapus — cleanup Fase 4.

create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  name             text not null,
  template_id      text not null,
  template_version integer not null default 1,
  draft_json       jsonb not null default '{}'::jsonb,
  published_json   jsonb,
  subdomain        text unique,
  status           text not null default 'draft'
                   check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.projects
  add constraint projects_published_requires_subdomain
  check (status <> 'published' or subdomain is not null);

create index if not exists projects_workspace_id_idx on public.projects(workspace_id);
create index if not exists projects_subdomain_idx on public.projects(subdomain)
  where subdomain is not null;

alter table public.projects enable row level security;

create policy "projects_owner_all" on public.projects
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));

create policy "projects_public_read_published" on public.projects
  for select to anon
  using (status = 'published');
