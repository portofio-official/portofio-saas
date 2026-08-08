-- Content Library: reusable project cards (image + title + description + link)
-- per workspace. Rows feed the standalone library manager page and the
-- in-editor "Insert from Library" picker.

create table if not exists public.content_library (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title        text not null default '',
  description  text not null default '',
  image_url    text not null default '',
  link         text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists content_library_workspace_id_idx
  on public.content_library(workspace_id);

alter table public.content_library enable row level security;

create policy "content_library_owner_all" on public.content_library
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));

-- Storage bucket for content images. Public so each item's image can render
-- on the published public site without extra auth.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content',
  'content',
  true,
  8388608,
  array['image/png'::text, 'image/jpeg'::text, 'image/webp'::text, 'image/gif'::text]
)
on conflict (id) do nothing;

-- Public read so published templates can display content-library images.
drop policy if exists "content_objects_public_read" on storage.objects;
create policy "content_objects_public_read" on storage.objects
  for select
  using (bucket_id = 'content');

-- Only the workspace owner may write into their own folder
-- (<workspace_id>/<uuid>.<ext>). Matches ANY workspace owned by auth.uid()
-- so multi-workspace accounts stay inside the folder of one of their own
-- workspaces.
drop policy if exists "content_objects_authenticated_write_own_folder" on storage.objects;
create policy "content_objects_authenticated_write_own_folder" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'content'
    and (storage.foldername(name))[1] in (
      select w.id::text from public.workspaces w where w.user_id = auth.uid()
    )
  );

drop policy if exists "content_objects_authenticated_update_own_folder" on storage.objects;
create policy "content_objects_authenticated_update_own_folder" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'content'
    and (storage.foldername(name))[1] in (
      select w.id::text from public.workspaces w where w.user_id = auth.uid()
    )
  );

drop policy if exists "content_objects_authenticated_delete_own_folder" on storage.objects;
create policy "content_objects_authenticated_delete_own_folder" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'content'
    and (storage.foldername(name))[1] in (
      select w.id::text from public.workspaces w where w.user_id = auth.uid()
    )
  );