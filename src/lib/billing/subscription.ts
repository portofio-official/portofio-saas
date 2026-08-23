import { createClient } from "@/lib/supabase/server";
import { SubscriptionRecord, SubscriptionStateDetails } from "./types";

const GRACE_PERIOD_DAYS = 7;

/**
 * Returns true if the currently authenticated user (or provided userId) has an active subscription
 * or is within the 7-day grace period.
 */
export async function checkSubscription(_email?: string, targetUserId?: string): Promise<boolean> {
  const state = await getSubscriptionState(targetUserId);
  return state.isActive;
}

/**
 * Returns detailed subscription state for a user (active status, grace period state, days remaining).
 */
export async function getSubscriptionState(targetUserId?: string): Promise<SubscriptionStateDetails> {
  let userId = targetUserId;

  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        isActive: false,
        status: "inactive",
        isGracePeriod: false,
        expiresAt: null,
      };
    }
    userId = user.id;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status, plan_id, billing_cycle, expires_at, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const record = data as (Partial<SubscriptionRecord> & { current_period_end?: string }) | null;

  if (!record || !record.status) {
    return {
      isActive: false,
      status: "inactive",
      isGracePeriod: false,
      expiresAt: null,
    };
  }

  let planName: string | null = null;
  let tier: SubscriptionStateDetails["tier"] = null;
  if (record.plan_id) {
    const { data: plan } = await supabase
      .from("plans")
      .select("name, tier")
      .eq("id", record.plan_id)
      .maybeSingle();
    planName = plan?.name ?? null;
    tier = (plan?.tier as SubscriptionStateDetails["tier"]) ?? null;
  }
  const cancelAtPeriodEnd = record.cancel_at_period_end === true;

  const now = new Date();
  const rawExpires = record.expires_at || record.current_period_end;
  const expiresAt = rawExpires ? new Date(rawExpires) : null;

  const base = {
    planId: record.plan_id,
    planName,
    tier,
    billingCycle: record.billing_cycle ?? null,
    cancelAtPeriodEnd,
  };

  // Active status check
  if (record.status === "active") {
    if (!expiresAt || expiresAt > now) {
      return {
        isActive: true,
        status: "active",
        isGracePeriod: false,
        expiresAt,
        ...base,
      };
    }
  }

  // Grace Period check
  if (record.status === "grace_period" || (record.status === "active" && expiresAt && expiresAt <= now)) {
    if (expiresAt) {
      const gracePeriodEnd = new Date(expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      if (now <= gracePeriodEnd) {
        const msRemaining = gracePeriodEnd.getTime() - now.getTime();
        const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
        return {
          isActive: true, // Still allowed to keep published site active during grace period
          status: "grace_period",
          isGracePeriod: true,
          expiresAt,
          daysRemainingInGracePeriod: daysRemaining,
          ...base,
        };
      }
    }
  }

  // Expired / Canceled / Inactive
  return {
    isActive: false,
    status: record.status as SubscriptionRecord["status"],
    isGracePeriod: false,
    expiresAt,
    ...base,
  };
}
