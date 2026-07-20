import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Note: This client bypasses RLS and has full access to the database (including auth schema).
// It should ONLY be used in secure Server Actions or Route Handlers after verifying
// the user's role (e.g., via requireRole(['admin'])).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
