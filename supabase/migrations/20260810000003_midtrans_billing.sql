-- Make the webhook idempotency key provider-neutral while preserving existing event data.
alter table public.billing_events
  rename column xendit_event_id to provider_event_id;

comment on column public.billing_events.provider_event_id is
  'Unique payment-provider event or transaction identifier used for webhook idempotency.';
