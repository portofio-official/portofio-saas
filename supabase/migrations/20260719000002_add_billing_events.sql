-- Migration: add billing_events table (Xendit webhook audit log)
-- Digunakan oleh billing-001 sebagai:
--   1. Audit trail semua transaksi dari Xendit
--   2. Idempotency key — mencegah proses ulang webhook yang sama
--
-- Hanya service_role (webhook handler) yang bisa menulis ke tabel ini.
-- User bisa baca event miliknya sendiri untuk keperluan UI (riwayat invoice, dll).

create table if not exists public.billing_events (
  id              uuid primary key default gen_random_uuid(),
  -- user_id nullable: kalau user dihapus, event history tetap tersimpan
  user_id         uuid references auth.users(id) on delete set null,
  -- xendit_event_id sebagai idempotency key — unique constraint mencegah duplikat
  xendit_event_id text unique not null,
  -- tipe event dari Xendit, e.g. 'invoice.paid', 'subscription.cancelled'
  event_type      text not null,
  -- raw payload dari Xendit webhook (simpan semua, query nanti kalau perlu)
  payload         jsonb not null default '{}',
  processed_at    timestamptz not null default now()
);

create index if not exists billing_events_user_id_idx
  on public.billing_events(user_id);

create index if not exists billing_events_event_type_idx
  on public.billing_events(event_type);

-- RLS: user bisa read event miliknya; hanya service_role yang write
alter table public.billing_events enable row level security;

create policy "billing_events_owner_select"
  on public.billing_events
  for select
  to authenticated
  using (user_id = auth.uid());

-- Tidak ada INSERT/UPDATE policy untuk authenticated —
-- semua write dilakukan dari server via service_role (bypass RLS).
