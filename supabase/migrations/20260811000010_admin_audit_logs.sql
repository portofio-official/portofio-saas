-- Admin control-plane audit trail.
-- Writes are server-side only; Admins can read the operational audit history.

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_idx
  on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_target_idx
  on public.admin_audit_logs(target_type, target_id);
create index if not exists admin_audit_logs_actor_idx
  on public.admin_audit_logs(actor_id, created_at desc);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "admin_audit_logs_admin_select" on public.admin_audit_logs;
create policy "admin_audit_logs_admin_select"
  on public.admin_audit_logs
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

comment on table public.admin_audit_logs is
  'Audit trail for privileged Admin control-plane actions. Writes use service_role only.';
