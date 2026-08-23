-- RLS perf follow-up to 20260823000000: the auth.uid() sweep left 4 admin-role
-- policies unwrapped because they check auth.jwt() instead (confirmed via
-- Supabase Advisor after applying that migration: profiles_admin_select_all,
-- template_submissions_admin_all, admin_audit_logs_admin_select,
-- templates_admin_update all use `auth.jwt() -> 'app_metadata' ->> 'role'`).
-- Same fix, same mechanism, scoped to auth.jwt() this time.
do $$
declare
  pol record;
  new_qual text;
  new_check text;
  stmt text;
  fixed_count int := 0;
begin
  for pol in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (
        (qual is not null and qual ~ 'auth\.jwt\(\)' and qual !~ '\(\s*SELECT\s+auth\.jwt\(\)')
        or
        (with_check is not null and with_check ~ 'auth\.jwt\(\)' and with_check !~ '\(\s*SELECT\s+auth\.jwt\(\)')
      )
  loop
    new_qual := case when pol.qual is not null
      then regexp_replace(pol.qual, 'auth\.jwt\(\)', '(select auth.jwt())', 'g')
      else null end;
    new_check := case when pol.with_check is not null
      then regexp_replace(pol.with_check, 'auth\.jwt\(\)', '(select auth.jwt())', 'g')
      else null end;

    stmt := format('alter policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    if new_qual is not null then
      stmt := stmt || format(' using (%s)', new_qual);
    end if;
    if new_check is not null then
      stmt := stmt || format(' with check (%s)', new_check);
    end if;

    execute stmt;
    fixed_count := fixed_count + 1;
  end loop;

  raise notice 'wrap_auth_jwt_rls_perf: rewrote % polic(y/ies)', fixed_count;
end $$;
