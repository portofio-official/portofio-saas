"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createMidtransTransaction } from "./midtrans";
import { getSubscriptionState } from "./subscription";
import { getActivePlan, DEFAULT_PLAN_ID } from "./plans";
import { requireRole } from "@/lib/auth/roles";

function getAppOrigin(): string {
  const configuredDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "localhost:3000";
  if (/^https?:\/\//i.test(configuredDomain)) return configuredDomain.replace(/\/+$/, "");
  return `${process.env.NODE_ENV === "production" ? "https" : "http"}://${configuredDomain}`;
}

export async function createCheckoutInvoiceAction(planId?: string): Promise<{ url?: string; error?: string }> {
  try {
    await requireRole(["user", "designer"]);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: "Authentication required to checkout" };
    }

    // The selected plan is always re-validated server-side; price and product id
    // come from the database catalog, never from the client.
    const selectedPlanId = planId || DEFAULT_PLAN_ID;
    const plan = await getActivePlan(selectedPlanId);
    if (!plan) {
      return { error: "Invalid or inactive subscription plan" };
    }

    const finishRedirectUrl = `${getAppOrigin()}/dashboard/billing?checkout=success`;
    const { redirectUrl } = await createMidtransTransaction({
      userId: user.id,
      email: user.email,
      finishRedirectUrl,
      plan,
    });

    return { url: redirectUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initiate checkout";
    return { error: message };
  }
}

export async function getSubscriptionStatusAction() {
  await requireRole(["user", "designer"]);
  return await getSubscriptionState();
}

/**
 * Self-service cancellation: does NOT unpublish or revoke access immediately.
 * There is no recurring auto-charge to stop in this prepaid-period billing
 * model (each checkout extends `expires_at`) — cancelling just flags that the
 * period should not be treated as an unintentional lapse when it ends. The
 * cron worker (check-subscriptions) reads this flag: cancelled periods expire
 * straight to `canceled` at `expires_at`, skipping the 7-day grace period
 * that's meant for accidental non-renewal.
 */
export async function cancelSubscriptionAction(): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .in("status", ["active", "grace_period"]);

  if (error) {
    console.error("[Billing] Failed to cancel subscription:", error);
    return { ok: false, error: "Failed to cancel subscription" };
  }

  revalidatePath("/dashboard/billing");
  return { ok: true };
}

/** Undo a pending cancellation while the current paid period is still active. */
export async function resumeSubscriptionAction(): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .in("status", ["active", "grace_period"]);

  if (error) {
    console.error("[Billing] Failed to resume subscription:", error);
    return { ok: false, error: "Failed to resume subscription" };
  }

  revalidatePath("/dashboard/billing");
  return { ok: true };
}

export async function activateDevSubscriptionAction(): Promise<{ ok: boolean; error?: string }> {
  try {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "Development subscription activation is disabled in production." };
    }
    await requireRole(["user", "designer"]);
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
      plan_id: DEFAULT_PLAN_ID,
      billing_cycle: "monthly",
      plan_snapshot: { tier: "basic", name: "Basic", billing_cycle: "monthly", price_idr: 49000 },
      current_period_start: now.toISOString(),
      expires_at: expiresAt,
      current_period_end: expiresAt,
      cancel_at_period_end: false,
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
