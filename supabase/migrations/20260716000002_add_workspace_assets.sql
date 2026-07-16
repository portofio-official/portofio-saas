-- Asset library per workspace.
-- ponytail: UI asset manager = Fase 2+. Tabel ada untuk URL terstruktur.

create table if not exists public.workspace_assets (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name         text not null,
  url          text not null,
  mime_type    text,
  size_bytes   bigint,
  created_at   timestamptz not null default now()
);

create index if not exists workspace_assets_workspace_id_idx
  on public.workspace_assets(workspace_id);

alter table public.workspace_assets enable row level security;

create policy "workspace_assets_owner_all" on public.workspace_assets
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));
