-- Migration: Update subscription statuses constraint (PRD 7.6 & Billing Audit Point 2)
-- Expands status enum check constraint to support full state machine:
-- ('active', 'inactive', 'grace_period', 'expired', 'canceled')

alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'inactive', 'grace_period', 'expired', 'canceled'));
