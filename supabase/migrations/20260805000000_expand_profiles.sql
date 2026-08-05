-- Migration: expand profiles table with contact and general data

alter table public.profiles
add column if not exists phone text,
add column if not exists address text,
add column if not exists nickname text,
add column if not exists headline text,
add column if not exists bio text,
add column if not exists contact_email text,
add column if not exists socials jsonb default '[]'::jsonb,
add column if not exists skills jsonb default '[]'::jsonb;
