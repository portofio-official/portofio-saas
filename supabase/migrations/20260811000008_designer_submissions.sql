-- Designer Portal: submission lifecycle, protected review fields, and private
-- source-package storage. Uploaded source is an untrusted artifact and is
-- never executed directly by the application.

alter table public.template_submissions
  add column if not exists submitted_at timestamptz,
  add column if not exists source_path text,
  add column if not exists source_filename text,
  add column if not exists source_size_bytes integer,
  add column if not exists preview_mobile_url text,
  add column if not exists license_name text,
  add column if not exists integration_status text not null default 'not_started',
  add column if not exists integration_notes text,
  add column if not exists integrated_at timestamptz;

alter table public.template_submissions
  drop constraint if exists template_submissions_status_check;

alter table public.template_submissions
  add constraint template_submissions_status_check
  check (status in ('draft', 'pending', 'approved', 'rejected', 'revision_requested'));

alter table public.template_submissions
  drop constraint if exists template_submissions_integration_status_check;

alter table public.template_submissions
  add constraint template_submissions_integration_status_check
  check (integration_status in ('not_started', 'in_review', 'merged', 'failed'));

create index if not exists template_submissions_integration_status_idx
  on public.template_submissions(integration_status);

-- Designers can edit their own metadata only while drafting or revising. A
-- trigger protects review-owned fields even if a client sends them directly.
drop policy if exists "template_submissions_designer_update" on public.template_submissions;
create policy "template_submissions_designer_update" on public.template_submissions
  for update
  to authenticated
  using (
    designer_id = auth.uid()
    and status in ('draft', 'revision_requested')
  )
  with check (designer_id = auth.uid());

create or replace function public.protect_template_submission_review_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
   -- Admin mutations use the server-side service_role client. Treat that
   -- trusted role the same as an authenticated admin for review-owned fields.
   if coalesce(auth.role(), '') <> 'service_role'
      and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    new.status := old.status;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.review_notes := old.review_notes;
    new.registry_id := old.registry_id;
    new.integration_status := old.integration_status;
    new.integration_notes := old.integration_notes;
    new.integrated_at := old.integrated_at;
    new.submitted_at := old.submitted_at;
  end if;
  return new;
end;
$$;

drop trigger if exists template_submissions_protect_review_fields on public.template_submissions;
create trigger template_submissions_protect_review_fields
  before update on public.template_submissions
  for each row execute procedure public.protect_template_submission_review_fields();

-- A private bucket keeps source ZIPs inaccessible to public portfolio visitors.
insert into storage.buckets (id, name, public)
values ('template-submissions', 'template-submissions', false)
on conflict (id) do update set public = false;

drop policy if exists "template_submissions_source_insert" on storage.objects;
create policy "template_submissions_source_insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'template-submissions'
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('designer', 'admin')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "template_submissions_source_select" on storage.objects;
create policy "template_submissions_source_select" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'template-submissions'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

drop policy if exists "template_submissions_source_update" on storage.objects;
create policy "template_submissions_source_update" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'template-submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "template_submissions_source_delete" on storage.objects;
create policy "template_submissions_source_delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'template-submissions'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
