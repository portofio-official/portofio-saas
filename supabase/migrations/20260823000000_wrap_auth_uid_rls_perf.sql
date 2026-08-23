-- RLS perf: wrap auth.uid() as (select auth.uid()) in every public-schema policy.
-- Unwrapped auth.uid() is re-evaluated per row; the subquery form lets Postgres
-- evaluate it once per statement (Supabase Advisor "auth_rls_initplan").
-- Flagged 2026-08-17 (Supabase Advisor) and 2026-08-22 (repo audit: 62 unwrapped
-- occurrences, 0 wrapped) — closes that gap.
--
-- Reads the live policy definitions from pg_policies (not the original CREATE
-- POLICY source, which may have been superseded by later ALTER POLICYs) and
-- rewrites each one that still calls auth.uid() unwrapped.
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
        (qual is not null and qual ~ 'auth\.uid\(\)' and qual !~ '\(select auth\.uid\(\)\)')
        or
        (with_check is not null and with_check ~ 'auth\.uid\(\)' and with_check !~ '\(select auth\.uid\(\)\)')
      )
  loop
    new_qual := case when pol.qual is not null
      then regexp_replace(pol.qual, 'auth\.uid\(\)', '(select auth.uid())', 'g')
      else null end;
    new_check := case when pol.with_check is not null
      then regexp_replace(pol.with_check, 'auth\.uid\(\)', '(select auth.uid())', 'g')
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

  raise notice 'wrap_auth_uid_rls_perf: rewrote % polic(y/ies)', fixed_count;
end $$;
