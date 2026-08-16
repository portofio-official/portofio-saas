-- 20260815000002_autosave_draft_json.sql
-- Autosave becomes a single in-place upsert on projects.draft_json instead of
-- inserting one full project_versions row per debounce (which raced on
-- max(version_number)+1 and grew without bound).
--
-- Data model after this migration:
--   projects.draft_json          = the live, editable draft (autosave target)
--   project_versions             = bounded history of meaningful snapshots
--                                  (create, publish, restore)
--   projects.published_version_id = immutable published snapshot
--   projects.current_version_id   = pointer to the most recent snapshot row
--                                   (kept as a history marker)

alter table public.projects
  add column if not exists draft_json jsonb not null default '{}'::jsonb;

-- Backfill existing projects' draft from their current version row (only rows
-- that still carry the '{}' default so a legitimately empty draft stays empty).
update public.projects p
set draft_json = v.content_json
from public.project_versions v
where v.id = p.current_version_id
  and p.draft_json = '{}'::jsonb;

-- Publish now snapshots the live autosaved draft (draft_json) into a new,
-- immutable project_versions row and points published_version_id at it. Runs
-- inside the existing per-account advisory lock, so max(version_number)+1 is
-- race-free for the publish path.
create or replace function public.publish_project(
  p_project_id uuid,
  p_subdomain   text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid;
  v_workspace_id uuid;
  v_blocked      text;
  v_taken        uuid;
  v_other_live   uuid;
  v_next_version integer;
  v_pub_version_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  select w.user_id, w.id into v_user_id, v_workspace_id
  from public.workspaces w
  join public.projects p on p.workspace_id = w.id
  where p.id = p_project_id;

  if v_user_id is null or v_user_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  if not exists (
    select 1 from public.workspaces w
    join public.projects p on p.workspace_id = w.id
    where p.id = p_project_id and w.user_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1 from public.subscriptions s
    where s.user_id = v_user_id and s.status in ('active', 'grace_period')
  ) then
    raise exception 'subscription_required';
  end if;

  select slug into v_blocked from public.subdomain_blocklist where slug = p_subdomain;
  if v_blocked is not null then
    raise exception 'subdomain_blocked';
  end if;

  select id into v_taken
  from public.projects
  where subdomain = p_subdomain and id <> p_project_id
  limit 1;
  if v_taken is not null then
    raise exception 'subdomain_taken';
  end if;

  select p2.id into v_other_live
  from public.projects p2
  join public.workspaces w on w.id = p2.workspace_id
  where w.user_id = v_user_id
    and p2.status = 'published'
    and p2.id <> p_project_id
  limit 1;
  if v_other_live is not null then
    raise exception 'one_live_site_per_account';
  end if;

  select coalesce(max(version_number), 0) + 1 into v_next_version
  from public.project_versions
  where project_id = p_project_id;

  insert into public.project_versions (project_id, version_number, content_json, schema_version, is_autosave)
  select p.id, v_next_version, p.draft_json, p.template_version, false
  from public.projects p
  where p.id = p_project_id
  returning id into v_pub_version_id;

  update public.projects
  set published_version_id = v_pub_version_id,
      current_version_id   = v_pub_version_id,
      subdomain            = p_subdomain,
      status               = 'published',
      published_at         = now(),
      updated_at           = now()
  where id = p_project_id;

  -- Bounded history: keep only the most recent 20 snapshots per project.
  -- (Autosave no longer creates rows, so this only trims repeated publishes.)
  delete from public.project_versions
  where project_id = p_project_id
    and version_number < v_next_version - 20;
end;
$$;

revoke execute on function public.publish_project(uuid, text) from anon;
revoke execute on function public.publish_project(uuid, text) from public;
