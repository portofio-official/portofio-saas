-- Harden the three-role model.
-- A normal signup and an authenticated profile owner must always remain `user`
-- unless a trusted server-side operation changes the role.

-- 1. Never trust signup metadata for privilege assignment.
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
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Prevent a user from changing its own role through the profiles update
-- policy. Service-role operations have no auth.uid() and remain able to assign
-- roles through a protected server-side workflow.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'role changes require a trusted server-side operation';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update of role on public.profiles
  for each row execute procedure public.prevent_profile_role_change();

-- 3. Admin support does not need access to the private workspace profile
-- payload. Keep customer portfolio content owner-only.
drop policy if exists "workspace_profile_admin_select_all" on public.workspace_profile;
