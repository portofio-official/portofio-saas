-- 20260815000003_billing_events_processed.sql
-- Adds a processed flag to billing_events so webhook idempotency is retry-safe:
--   - event insert is the atomic lock (unique provider_event_id)
--   - processed=false  -> the previous attempt failed midway; reprocess on retry
--   - processed=true   -> duplicate notification; ignore
-- Previously the handler only checked "event exists" before the insert, which
-- raced on concurrent duplicates and could not recover after a partial failure.

alter table public.billing_events
  add column if not exists processed boolean not null default false;

create index if not exists billing_events_processed_idx
  on public.billing_events(processed);
