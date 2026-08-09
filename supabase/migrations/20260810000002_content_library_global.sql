-- Make Content Library account-global: items belong to the authenticated user
-- instead of a single workspace, so any workspace/project on the account can
-- resolve the same active library content.
-- Existing rows keep their owner (backfilled from the owning workspace).

-- 1. Add the owning user and backfill from the existing workspace's owner.
alter table public.content_library add column if not exists user_id uuid references auth.users(id) on delete cascade;

update public.content_library cl
set user_id = w.user_id
from public.workspaces w
where w.id = cl.workspace_id
  and cl.user_id is null;

-- 2. Drop orphaned rows (no resolvable owner) and enforce ownership.
delete from public.content_library where user_id is null;
alter table public.content_library alter column user_id set not null;

-- 3. Remove the per-workspace scoping. The old owner policy references
--    workspace_id, so it must be dropped before the column can go away.
drop policy if exists "content_library_owner_all" on public.content_library;
alter table public.content_library drop constraint if exists content_library_workspace_id_fkey;
drop index if exists content_library_workspace_id_idx;
alter table public.content_library drop column if exists workspace_id;

-- 4. Rebuild indexes for the user scope.
drop index if exists content_library_type_order_idx;
create index if not exists content_library_user_idx on public.content_library(user_id);
create index if not exists content_library_user_type_order_idx
  on public.content_library(user_id, content_type, is_active, sort_order);

-- 5. RLS: scope directly on the item's owner.
create policy "content_library_owner_all" on public.content_library
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 6. Storage: write folders are now the user's own folder (<user_id>/<uuid>.<ext>)
--    instead of <workspace_id>/... so one library folder serves the whole account.
drop policy if exists "content_objects_authenticated_write_own_folder" on storage.objects;
create policy "content_objects_authenticated_write_own_folder" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'content'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "content_objects_authenticated_update_own_folder" on storage.objects;
create policy "content_objects_authenticated_update_own_folder" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'content'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "content_objects_authenticated_delete_own_folder" on storage.objects;
create policy "content_objects_authenticated_delete_own_folder" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'content'
    and (storage.foldername(name))[1] = auth.uid()::text
  );