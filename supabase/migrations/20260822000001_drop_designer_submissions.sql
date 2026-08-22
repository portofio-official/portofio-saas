-- Retire the ZIP-upload Designer Portal (designer-001). Product decision
-- 2026-08-22 (see docs/PRD.md Section 9A / 17.1): the code-review-and-merge
-- template pipeline is replaced by the data-driven architecture in Section
-- 9A (layout_json, never executed). This migration removes the table,
-- trigger, function, and private storage bucket that backed the old flow.
-- Nothing here is reused by Section 9A — that work defines its own
-- templates/template_versions tables when Fase 2 starts.

drop trigger if exists template_submissions_protect_review_fields on public.template_submissions;
drop function if exists public.protect_template_submission_review_fields();

drop policy if exists "template_submissions_source_insert" on storage.objects;
drop policy if exists "template_submissions_source_select" on storage.objects;
drop policy if exists "template_submissions_source_update" on storage.objects;
drop policy if exists "template_submissions_source_delete" on storage.objects;

delete from storage.objects where bucket_id = 'template-submissions';
delete from storage.buckets where id = 'template-submissions';

drop table if exists public.template_submissions;
