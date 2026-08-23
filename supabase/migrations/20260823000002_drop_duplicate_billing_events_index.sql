-- Supabase Advisor (performance, duplicate_index): billing_events had two
-- identical unique btree indexes on provider_event_id —
-- billing_events_xendit_event_id_key (backs the UNIQUE constraint of the
-- same name, keeps webhook idempotency lookups working) and
-- billing_events_provider_event_id_idx (a redundant bare index, no
-- constraint attached). Drop the redundant one only.
drop index if exists public.billing_events_provider_event_id_idx;
