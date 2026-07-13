-- sites.subdomain was NOT NULL from row creation, which would force a
-- subdomain decision the moment a template is selected (template-001/
-- workspace-001, free, PRD 7.3) — but subdomain choice + payment only belong
-- at actual publish time (publish-001, PRD 7.4). Relax the constraint: a
-- draft site can exist with no subdomain yet; only a published one needs it.
-- (Postgres's UNIQUE constraint already permits multiple NULLs, so several
-- draft sites without a subdomain is fine.)

alter table public.sites alter column subdomain drop not null;

alter table public.sites
  add constraint sites_published_requires_subdomain
  check (status <> 'published' or subdomain is not null);
