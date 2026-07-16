// ponytail: stub for billing-001. Replace with real Xendit webhook-driven check.
import { createClient } from "@/lib/supabase/server";

/**
 * Returns true if the currently authenticated user has an active subscription.
 * Subscription is per-account (PRD §7.6 default).
 * `email` param reserved for billing-001 Xendit integration; currently unused.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkSubscription(email: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("subscriptions")
    .select("status, expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return false;
  if (data.status !== "active") return false;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
  return true;
}

