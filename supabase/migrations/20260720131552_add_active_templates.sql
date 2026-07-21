-- Migration: add templates table to manage visibility of built-in templates

create table if not exists public.templates (
  id text primary key,
  name text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: anon/authenticated can select, service_role can write
alter table public.templates enable row level security;

create policy "templates_public_select"
  on public.templates
  for select
  to anon, authenticated
  using (true);

create policy "templates_admin_update"
  on public.templates
  for update
  to authenticated
  using ( (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' )
  with check ( (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' );

-- Seed existing built-in templates
insert into public.templates (id, name, is_active) values
  ('minimal', 'Minimal', true),
  ('bold', 'Bold', true),
  ('creative', 'Creative', true),
  ('corporate', 'Corporate', true),
  ('dark', 'Dark', true),
  ('studio', 'Studio', true),
  ('portfolio-pro', 'Portfolio Pro', true)
on conflict (id) do nothing;
