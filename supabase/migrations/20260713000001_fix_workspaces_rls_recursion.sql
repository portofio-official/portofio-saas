-- Fix: "infinite recursion detected in policy for relation workspaces".
--
-- Root cause: the four "_owner_*" policies (workspaces_owner_all,
-- portfolio_data_owner_all, sites_owner_all, subscriptions_owner_read) were
-- declared without a `to authenticated` restriction, so Postgres also
-- considers them when evaluating queries from the `anon` role — not just
-- from logged-in users. That let an anon query cross back and forth between
-- tables: anon reading `workspaces` evaluates workspaces_public_read_published,
-- which queries `sites`; evaluating that query also considers sites_owner_all
-- (since it wasn't restricted to authenticated), whose USING clause queries
-- `workspaces` again -> infinite recursion. Confirmed via a live smoke test:
-- anon reads on workspaces/portfolio_data/sites all failed with this error
-- before this fix.
--
-- Restricting the owner policies to `authenticated` stops Postgres from
-- ever evaluating them for anon, breaking the cycle. The dedicated
-- "_public_read_published" policies already handle anon access correctly.

alter policy "workspaces_owner_all" on public.workspaces to authenticated;
alter policy "portfolio_data_owner_all" on public.portfolio_data to authenticated;
alter policy "sites_owner_all" on public.sites to authenticated;
alter policy "subscriptions_owner_read" on public.subscriptions to authenticated;
