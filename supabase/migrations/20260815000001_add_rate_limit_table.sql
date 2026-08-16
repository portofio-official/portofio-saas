-- 20260815000001_add_rate_limit_table.sql
-- Durable, multi-instance-safe rate limiting for serverless (Vercel).
-- Replaces the in-memory Map limiter in src/lib/rate-limit.ts that was
-- bypassable across instances and lost on cold start.
--
-- Fixed-window counter, one row per identifier. The check RPC performs a single
-- atomic INSERT ... ON CONFLICT, so concurrent requests cannot double-increment
-- or both read a stale count.
--
-- No public RLS access: only service_role (which bypasses RLS) may read/write.

create table if not exists public.rate_limits (
  key          text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

-- Returns (allowed, retry_after_seconds). Every attempt is counted; when the
-- count exceeds the limit the identifier is rejected until the window ends.
-- Invalid inputs and database errors fail open so a limiter bug never locks
-- legitimate users out.
create or replace function public.rate_limit_check(
  p_key text,
  p_max integer,
  p_window_ms bigint
) returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now      timestamptz := now();
  v_interval interval;
  v_count    integer;
  v_win_start timestamptz;
begin
  if p_key is null or p_key = '' or p_max is null or p_max <= 0
     or p_window_ms is null or p_window_ms <= 0 then
    return query select true::boolean, 0::integer;
    return;
  end if;

  v_interval := make_interval(secs => p_window_ms::double precision / 1000.0);

  -- Atomic: reset the window when it has expired, otherwise increment.
  insert into public.rate_limits (key, count, window_start, updated_at)
  values (p_key, 1, v_now, v_now)
  on conflict (key) do update set
    count = case
      when public.rate_limits.window_start + v_interval <= now() then 1
      else public.rate_limits.count + 1
    end,
    window_start = case
      when public.rate_limits.window_start + v_interval <= now() then now()
      else public.rate_limits.window_start
    end,
    updated_at = now()
  returning count, window_start into v_count, v_win_start;

  if v_count > p_max then
    -- Keep the counter bounded so a sustained attack does not inflate it.
    update public.rate_limits set count = p_max where key = p_key and count > p_max;
    return query select false::boolean,
      greatest(0, ceil(extract(epoch from (v_win_start + v_interval - now())))::integer);
    return;
  end if;

  return query select true::boolean, 0::integer;
end;
$$;

-- Only service_role may invoke the limiter.
revoke all on function public.rate_limit_check(text, integer, bigint) from public;
revoke all on function public.rate_limit_check(text, integer, bigint) from anon;
revoke all on function public.rate_limit_check(text, integer, bigint) from authenticated;
