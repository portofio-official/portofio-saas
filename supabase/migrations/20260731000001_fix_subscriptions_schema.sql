-- Migration: Fix subscriptions table schema for billing gate and dev sandbox
-- Ensures expires_at, updated_at, unique index on user_id, and full status constraint exist.

-- 1. Add expires_at column if missing
alter table public.subscriptions 
  add column if not exists expires_at timestamptz;

-- 2. Populate expires_at from current_period_end if available
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'current_period_end'
  ) then
    update public.subscriptions 
    set expires_at = current_period_end 
    where expires_at is null and current_period_end is not null;
  end if;
end $$;

-- 3. Add updated_at column if missing
alter table public.subscriptions 
  add column if not exists updated_at timestamptz not null default now();

-- 4. Ensure unique constraint on user_id for upsert compatibility
drop index if exists public.subscriptions_user_id_idx;
create unique index if not exists subscriptions_user_id_unique_idx on public.subscriptions(user_id);

-- 5. Update status check constraint
alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'inactive', 'grace_period', 'expired', 'canceled'));
