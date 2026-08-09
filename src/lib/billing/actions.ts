"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMidtransTransaction } from "./midtrans";
import { getSubscriptionState } from "./subscription";

export async function createCheckoutInvoiceAction(): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: "Authentication required to checkout" };
    }

    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "http://localhost:3000";
    const finishRedirectUrl = `${domain}/dashboard/billing?checkout=success`;
    const { redirectUrl } = await createMidtransTransaction({
      userId: user.id,
      email: user.email,
      finishRedirectUrl,
    });

    return { url: redirectUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initiate checkout";
    return { error: message };
  }
}

export async function getSubscriptionStatusAction() {
  return await getSubscriptionState();
}

export async function activateDevSubscriptionAction(): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required" };
    }

    const adminSupabase = createAdminClient();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Try upsert with all standard fields (expires_at + current_period_end + updated_at)
    const payload: Record<string, unknown> = {
      user_id: user.id,
      status: "active",
      expires_at: expiresAt,
      current_period_end: expiresAt,
      updated_at: now.toISOString(),
    };

    let { error } = await adminSupabase
      .from("subscriptions")
      .upsert(payload, { onConflict: "user_id" });

    // 2. Fallback if a specific column doesn't exist on older schema cache
    if (error && error.code === "PGRST204") {
      console.warn("[DevSubscription] Column missing in schema, retrying with fallback fields:", error.message);

      if (error.message.includes("expires_at")) {
        delete payload.expires_at;
      }
      if (error.message.includes("current_period_end")) {
        delete payload.current_period_end;
      }
      if (error.message.includes("updated_at")) {
        delete payload.updated_at;
      }

      const retryRes = await adminSupabase
        .from("subscriptions")
        .upsert(payload, { onConflict: "user_id" });

      error = retryRes.error;
    }

    if (error) {
      console.error("[DevSubscription] Failed to activate dev subscription:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate subscription";
    return { ok: false, error: message };
  }
}

