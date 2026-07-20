-- Admin read-only access to workspaces
create policy "workspaces_admin_select_all"
  on public.workspaces for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to workspace_profile
create policy "workspace_profile_admin_select_all"
  on public.workspace_profile for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to projects
create policy "projects_admin_select_all"
  on public.projects for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to subscriptions
create policy "subscriptions_admin_select_all"
  on public.subscriptions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin read-only access to billing_events
create policy "billing_events_admin_select_all"
  on public.billing_events for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
