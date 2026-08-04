-- Migration: Fix RLS policies on published projects and project_versions
-- Ensures published projects and their published version contents are readable by 'public' (both authenticated & anon users).

drop policy if exists "projects_public_read_published" on public.projects;
create policy "projects_public_read_published" on public.projects
  for select to public
  using (status = 'published');

drop policy if exists "project_versions_public_read_published" on public.project_versions;
create policy "project_versions_public_read_published" on public.project_versions
  for select to public
  using (exists (
    select 1 from public.projects p
    where p.id = project_versions.project_id
      and p.published_version_id = project_versions.id
      and p.status = 'published'
  ));
