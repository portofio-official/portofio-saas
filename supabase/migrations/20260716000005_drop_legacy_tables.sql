-- Drop legacy tables that are now replaced by projects, workspace_profile, and workspace_assets.
-- Drop them in the correct order to handle foreign keys if any.

drop table if exists public.sites cascade;
drop table if exists public.portfolio_data cascade;
