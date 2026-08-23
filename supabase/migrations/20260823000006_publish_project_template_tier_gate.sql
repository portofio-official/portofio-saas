-- Closes a defense-in-depth gap found in the Session 106/107 crosscheck:
-- publishProjectAction (JS) already checks a project's template
-- (templates.minimum_plan) against the caller's entitlement tier before
-- publishing, but publish_project() — the hardened SECURITY DEFINER RPC that
-- atomically owns every OTHER publish invariant (ownership, subscription,
-- blocklist, subdomain uniqueness, one-live-site quota) — had no matching
-- check. A caller invoking publish_project() directly (bypassing the server
-- action) could publish a Premium/Enterprise-only template on a Basic
-- account. Adds the same tier check inside the RPC's transaction, right next
-- to the existing subscription_required check it mirrors.
create or replace function public.publish_project(p_project_id uuid, p_subdomain text)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id      uuid;
  v_workspace_id uuid;
  v_blocked      text;
  v_taken        uuid;
  v_other_live   uuid;
  v_next_version integer;
  v_pub_version_id uuid;
  v_minimum_plan text;
  v_caller_tier  text;
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

  -- Template minimum-plan gate. Missing templates row -> 'basic' (open),
  -- same lenient default as the app-side getTemplateMinimumPlan(). Only
  -- resolves the caller's tier when the template actually requires more
  -- than basic, since an active subscription (checked above) is not itself
  -- proof entitlements resolves a row for every edge case, and basic-tier
  -- templates need no rank comparison at all.
  select coalesce(t.minimum_plan, 'basic') into v_minimum_plan
  from public.projects p
  left join public.templates t on t.id = p.template_id
  where p.id = p_project_id;

  if v_minimum_plan <> 'basic' then
    select tier into v_caller_tier from public.get_user_entitlements(v_user_id);
    if (case v_caller_tier when 'basic' then 0 when 'premium' then 1 when 'enterprise' then 2 else -1 end)
       < (case v_minimum_plan when 'basic' then 0 when 'premium' then 1 when 'enterprise' then 2 else 99 end)
    then
      raise exception 'template_requires_%', v_minimum_plan;
    end if;
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
$function$;
