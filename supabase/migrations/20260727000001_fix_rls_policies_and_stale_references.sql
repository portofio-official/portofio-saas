-- Migration: Fix RLS policies and stale table references (PRD 9.4 RLS Audit)
-- 1. Restrict owner policies on workspace_profile, workspace_assets, and projects to `authenticated`
--    to prevent Postgres from evaluating them for `anon` queries (prevents recursion & unexpected checks).
-- 2. Update public read policies for `workspaces` and `workspace_profile` to reference `public.projects`
--    (with status = 'published') instead of the dropped legacy `public.sites` table.

-- 1. Fix workspace_profile owner policy
alter policy "workspace_profile_owner_all" on public.workspace_profile to authenticated;

-- 2. Fix workspace_assets owner policy
alter policy "workspace_assets_owner_all" on public.workspace_assets to authenticated;

-- 3. Fix projects owner policy
alter policy "projects_owner_all" on public.projects to authenticated;

-- 4. Fix workspaces_public_read_published to reference projects instead of sites
drop policy if exists "workspaces_public_read_published" on public.workspaces;
create policy "workspaces_public_read_published" on public.workspaces
  for select to anon
  using (exists (
    select 1 from public.projects p
    where p.workspace_id = workspaces.id and p.status = 'published'
  ));

-- 5. Fix workspace_profile_public_read to reference projects instead of sites
drop policy if exists "workspace_profile_public_read" on public.workspace_profile;
create policy "workspace_profile_public_read" on public.workspace_profile
  for select to anon
  using (exists (
    select 1 from public.projects p
    where p.workspace_id = workspace_id and p.status = 'published'
  ));
