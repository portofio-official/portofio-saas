-- Supabase Advisor (performance, unindexed_foreign_keys): 6 foreign keys had
-- no covering index, which slows joins on these columns and row locks on
-- delete of the referenced row (Postgres has to seq-scan the child table to
-- check for references). Adds one plain btree index per FK column.
create index if not exists payment_transactions_subscription_id_idx
  on public.payment_transactions (subscription_id);
create index if not exists payment_transactions_user_id_idx
  on public.payment_transactions (user_id);
create index if not exists project_versions_created_by_idx
  on public.project_versions (created_by);
create index if not exists projects_current_version_id_idx
  on public.projects (current_version_id);
create index if not exists projects_published_version_id_idx
  on public.projects (published_version_id);
create index if not exists template_submissions_reviewed_by_idx
  on public.template_submissions (reviewed_by);
