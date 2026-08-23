-- Clean-code follow-up to 20260822000002_custom_domains.sql: `domain text not
-- null unique` already creates an implicit unique btree index on `domain`.
-- The explicit custom_domains_domain_idx was a second, non-unique index on
-- the exact same column — pure write/storage overhead, no query benefit.
drop index if exists public.custom_domains_domain_idx;
