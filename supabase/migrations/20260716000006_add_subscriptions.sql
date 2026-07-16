-- Migration: add subscriptions table for billing gate
-- ponytail: minimal schema — just what publish gate needs now.
-- billing-001 (Xendit integration) will add invoice_id, plan_id, etc.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- one subscription record per user
create unique index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- RLS: users can only read their own subscription; only service role writes
alter table public.subscriptions enable row level security;

create policy "subscriptions_owner_select"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());
