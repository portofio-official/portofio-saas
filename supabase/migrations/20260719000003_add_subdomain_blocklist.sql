-- Migration: add subdomain_blocklist table (PRD 9.5 & 15)
-- Menyimpan slug yang tidak boleh dipakai sebagai subdomain pengguna.
-- Lebih baik di DB daripada hardcoded di kode:
--   - Admin bisa tambah/hapus tanpa deploy ulang
--   - publishProjectAction tinggal query tabel ini

create table if not exists public.subdomain_blocklist (
  slug text primary key check (slug = lower(slug)) -- pastikan selalu lowercase
);

-- RLS: semua (anon + authenticated) bisa baca, hanya service_role yang write
alter table public.subdomain_blocklist enable row level security;

create policy "subdomain_blocklist_public_select"
  on public.subdomain_blocklist
  for select
  to anon, authenticated
  using (true);

-- Seed: kata-kata yang umum dipakai untuk sistem / berisiko disalahgunakan
-- Update daftar ini tanpa migration baru — cukup INSERT dari SQL Editor.
insert into public.subdomain_blocklist (slug) values
  -- sistem & routing
  ('www'),
  ('api'),
  ('app'),
  ('mail'),
  ('smtp'),
  ('ftp'),
  ('cdn'),
  ('static'),
  ('assets'),
  ('media'),
  -- admin & internal
  ('admin'),
  ('dashboard'),
  ('console'),
  ('panel'),
  ('control'),
  ('manage'),
  ('staff'),
  ('internal'),
  ('ops'),
  ('devops'),
  -- brand/produk
  ('portofio'),
  ('portofyo'),
  ('support'),
  ('help'),
  ('docs'),
  ('status'),
  ('blog'),
  ('about'),
  ('contact'),
  ('pricing'),
  -- keamanan
  ('login'),
  ('logout'),
  ('signup'),
  ('register'),
  ('auth'),
  ('oauth'),
  ('callback'),
  ('webhook'),
  -- subdomain umum berbahaya
  ('localhost'),
  ('test'),
  ('demo'),
  ('dev'),
  ('staging'),
  ('production'),
  ('null'),
  ('undefined')
on conflict (slug) do nothing; -- idempoten
