-- Migration: add template_submissions table (Fase 2 — Designer Marketplace)
-- Designer eksternal submit template mereka untuk di-review admin.
-- Alur: designer submit → status 'pending' → admin review → 'approved'/'rejected'
-- Setelah approved, admin menambahkan template ke TEMPLATE_REGISTRY di kode
-- (arsitektur template saat ini berbasis kode, bukan DB — lihat PRD 9.3).
--
-- Tabel ini adalah STUB untuk Fase 2. Belum ada UI untuk ini di MVP.
-- Dibuat sekarang agar schema siap dan tidak breaking saat Fase 2 dimulai.

create table if not exists public.template_submissions (
  id              uuid primary key default gen_random_uuid(),

  -- Siapa yang submit (harus punya role 'designer' atau 'admin')
  designer_id     uuid not null references auth.users(id) on delete cascade,

  -- Metadata template
  name            text not null,
  description     text,
  -- URL preview screenshot template (di Supabase Storage atau external)
  preview_url     text,
  -- URL ke source code / ZIP template yang diupload designer ke Supabase Storage
  source_url      text,
  -- Kategori template (optional, untuk filtering galeri nanti)
  category        text check (category in ('minimal', 'creative', 'corporate', 'developer', 'agency', 'other')),
  -- Tag tambahan (e.g. ['dark-mode', 'portfolio', 'freelancer'])
  tags            text[] not null default '{}',

  -- Review workflow
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected', 'revision_requested')),
  reviewed_by     uuid references auth.users(id) on delete set null, -- admin yang review
  reviewed_at     timestamptz,
  review_notes    text, -- catatan dari admin (alasan reject / minta revisi)

  -- Setelah approved, template_id di TEMPLATE_REGISTRY
  -- (diisi manual oleh admin setelah kode template dimerge)
  registry_id     text unique, -- e.g. 'minimal', 'bold', dsb — nullable sampai merge

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists template_submissions_designer_id_idx
  on public.template_submissions(designer_id);

create index if not exists template_submissions_status_idx
  on public.template_submissions(status);

-- RLS
alter table public.template_submissions enable row level security;

-- Designer: bisa lihat submission milik sendiri
create policy "template_submissions_designer_select"
  on public.template_submissions
  for select
  to authenticated
  using (designer_id = auth.uid());

-- Designer: bisa submit (insert) — hanya kalau role = 'designer' atau 'admin'
create policy "template_submissions_designer_insert"
  on public.template_submissions
  for insert
  to authenticated
  with check (
    designer_id = auth.uid()
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('designer', 'admin')
  );

-- Designer: bisa update submission sendiri, tapi hanya kalau masih 'pending' atau 'revision_requested'
create policy "template_submissions_designer_update"
  on public.template_submissions
  for update
  to authenticated
  using (
    designer_id = auth.uid()
    and status in ('pending', 'revision_requested')
  )
  with check (
    designer_id = auth.uid()
    -- Designer tidak bisa ubah status, reviewed_by, reviewed_at, registry_id sendiri
  );

-- Admin: bisa lihat dan update semua submission (untuk review panel)
create policy "template_submissions_admin_all"
  on public.template_submissions
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Auto-update updated_at
create trigger template_submissions_updated_at
  before update on public.template_submissions
  for each row execute procedure public.set_updated_at();
