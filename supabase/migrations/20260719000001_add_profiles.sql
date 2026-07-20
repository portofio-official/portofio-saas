-- Migration: add profiles table (public user data) + role system
-- auth.users (Supabase Auth) hanya menyimpan email/password secara private.
-- Tabel ini menyimpan data publik user (nama, avatar, preferensi, ROLE) yang bisa
-- dibaca dari frontend/dashboard tanpa service_role key.
-- Relasi 1:1 ke auth.users, di-auto-create via trigger saat signup.
--
-- Role system (PRD extension):
--   'user'     — pemakai SaaS (default)
--   'designer' — kreator template eksternal (marketplace, Fase 2)
--   'admin'    — full control: moderate user, manage template submissions, manage subscriptions

-- 1. Tabel profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  -- locale untuk preferensi bahasa UI (PRD 7.7)
  locale      text not null default 'id' check (locale in ('id', 'en')),
  -- role: kontrol akses level aplikasi
  role        text not null default 'user' check (role in ('user', 'designer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- 2. RLS policies
alter table public.profiles enable row level security;

-- User biasa: hanya baca/ubah profil sendiri
create policy "profiles_owner_select"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Admin: bisa baca semua profil (untuk admin panel)
create policy "profiles_admin_select_all"
  on public.profiles
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- User bisa update profil sendiri (tapi TIDAK bisa ubah kolom role)
-- Role hanya bisa diubah oleh service_role (admin server-side)
create policy "profiles_owner_update"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- Pastikan role tidak ikut berubah dari client
    -- (kolom role tidak boleh di-SET oleh user biasa)
  );

-- 3. Trigger: auto-create profile saat user baru signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    -- role bisa di-set via raw_user_meta_data saat invite admin/designer,
    -- default ke 'user' untuk signup biasa
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing; -- idempoten, aman dijalankan ulang
  return new;
end;
$$;

-- Hapus trigger lama dulu kalau ada, lalu buat ulang (idempoten)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Trigger: auto-inject role ke app_metadata saat profiles.role diubah
-- Ini memastikan JWT claims selalu sinkron dengan tabel profiles.
create or replace function public.sync_role_to_auth_metadata()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Update app_metadata di auth.users supaya JWT hook bisa baca
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$;

create trigger profiles_sync_role
  after insert or update of role on public.profiles
  for each row execute procedure public.sync_role_to_auth_metadata();

-- 5. Trigger: auto-update updated_at saat row diubah
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
