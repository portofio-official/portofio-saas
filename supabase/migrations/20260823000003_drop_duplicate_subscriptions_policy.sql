-- Supabase Advisor (performance, multiple_permissive_policies): subscriptions
-- had two byte-identical SELECT policies for role authenticated
-- (subscriptions_owner_read, subscriptions_owner_select — same qual
-- `user_id = (select auth.uid())`, same with_check null). Genuine leftover
-- duplicate from a rename, not two different access rules. Drop one.
drop policy if exists subscriptions_owner_select on public.subscriptions;
