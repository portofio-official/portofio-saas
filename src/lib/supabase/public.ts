import { createClient } from "@supabase/supabase-js";

// Anon-key client for public, unauthenticated reads (published sites, analytics).
// Respects RLS — never bypasses policies. Do NOT use this for admin/cron/webhook work.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
