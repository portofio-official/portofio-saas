-- Atomic publish: copy draft_json → published_json, set subdomain + status.
-- SECURITY DEFINER to bypass row-level uniqueness check while still enforcing
-- ownership via explicit auth.uid() comparison.

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
    published_json = draft_json,
    subdomain      = p_subdomain,
    status         = 'published',
    published_at   = now(),
    updated_at     = now()
  where id = p_project_id;
end;
$$;
