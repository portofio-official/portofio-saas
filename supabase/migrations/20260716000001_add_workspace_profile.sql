-- WorkspaceProfile: data induk bisnis per workspace (1:1).
-- Kolom terstruktur untuk data yang perlu di-query/filter;
-- JSONB extended_data untuk field yang tidak perlu di-index.

create table if not exists public.workspace_profile (
  workspace_id  uuid primary key references public.workspaces(id) on delete cascade,
  name          text,
  logo_url      text,
  email         text,
  phone         text,
  address       text,
  website_url   text,
  extended_data jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);

alter table public.workspace_profile enable row level security;

create policy "workspace_profile_owner_all" on public.workspace_profile
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));

-- Anon: read profile for workspaces that have a published site
create policy "workspace_profile_public_read" on public.workspace_profile
  for select to anon
  using (exists (
    select 1 from public.sites s
    where s.workspace_id = workspace_id and s.status = 'published'
  ));
