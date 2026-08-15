-- 20260815000000_harden_publish_project_rpc.sql
-- Hardens public.publish_project() so publish invariants are enforced atomically
-- inside a single SECURITY DEFINER transaction instead of check-then-act in the
-- server action:
--   0. The CALLER must be the owner of the project (auth.uid() check) — a
--      malicious caller must never be able to publish someone else's project.
--   1. Ownership is re-verified under the per-account lock.
--   2. Subdomain must not be in the blocklist.
--   3. Subdomain must be unique across the platform (excluding self, so
--      republishing to the same subdomain keeps working).
--   4. At most ONE live (published) site per account across all of the user's
--      workspaces — enforced with a per-account advisory lock so two concurrent
--      publish calls cannot both pass the check.
--   5. An active (or grace-period) subscription is required to publish, so the
--      RPC cannot be used to bypass the billing gate by calling it directly.
--
-- Raises distinct exceptions the app maps to user-facing errors:
--   'not authorized', 'subdomain_blocked', 'subdomain_taken',
--   'one_live_site_per_account', 'subscription_required'.
--
-- Requires the prior project_versions migration (20260728000001) that changed
-- the function to snapshot current_version_id -> published_version_id.

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
begin
  -- The caller must be an authenticated user. SECURITY DEFINER bypasses RLS,
  -- so without this explicit check the function would trust the project id it
  -- is given and let anyone publish anyone else's project.
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  -- Resolve the owning user/workspace up front.
  select w.user_id, w.id into v_user_id, v_workspace_id
  from public.workspaces w
  join public.projects p on p.workspace_id = w.id
  where p.id = p_project_id;

  if v_user_id is null or v_user_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  -- Serialize publishes per account so the one-live-site check is race-free.
  -- All publishes must go through this RPC, so the advisory lock is consistent.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  -- Re-verify ownership under the lock (project/workspace may have changed).
  if not exists (
    select 1 from public.workspaces w
    join public.projects p on p.workspace_id = w.id
    where p.id = p_project_id and w.user_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  -- Billing gate (defense in depth): an active or grace-period subscription is
  -- required. The app also gates before calling, but a direct RPC call must not
  -- bypass monetization.
  if not exists (
    select 1 from public.subscriptions s
    where s.user_id = v_user_id
      and s.status in ('active', 'grace_period')
  ) then
    raise exception 'subscription_required';
  end if;

  -- Blocklist.
  select slug into v_blocked from public.subdomain_blocklist where slug = p_subdomain;
  if v_blocked is not null then
    raise exception 'subdomain_blocked';
  end if;

  -- Uniqueness across all projects (self excluded so republish works).
  select id into v_taken
  from public.projects
  where subdomain = p_subdomain and id <> p_project_id
  limit 1;
  if v_taken is not null then
    raise exception 'subdomain_taken';
  end if;

  -- One live site per account (all workspaces, excluding this project).
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

  update public.projects
  set published_version_id = current_version_id,
      subdomain            = p_subdomain,
      status               = 'published',
      published_at         = now(),
      updated_at           = now()
  where id = p_project_id;
end;
$$;

-- Anonymous callers must never be able to invoke the publish RPC. PUBLIK grant
-- would include the anon role, so it is revoked as well (authenticated keeps its
-- explicit grant, which is what the app uses).
revoke execute on function public.publish_project(uuid, text) from anon;
revoke execute on function public.publish_project(uuid, text) from public;
