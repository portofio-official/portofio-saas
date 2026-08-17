import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MIDTRANS_ORDER_PLAN_IDS,
  verifyMidtransNotificationSignature,
} from "@/lib/billing/midtrans";
import { softUnpublishUserProjects } from "@/lib/billing/unpublish";
import { getActivePlanByAdmin, DEFAULT_PLAN_ID, PERIOD_DAYS, toPlanSnapshot } from "@/lib/billing/plans";
import type { MidtransNotificationPayload, PlanRecord } from "@/lib/billing";

const ORDER_ID_PATTERN = /^sub_([0-9a-f-]{36})_([a-z-]+)_\d+$/i;
const LEGACY_ORDER_PATTERN = /^sub_([0-9a-f-]{36})_\d+$/i;
const COMPACT_ORDER_ID_PATTERN = /^sub_([0-9a-f]{32})_([a-z]{2})_[0-9a-z]+$/i;
const EVENT_UNIQUE_VIOLATION = "23505";

interface OrderParts {
  userId: string | null;
  planId: string | null;
}

function parseOrderId(orderId: string | undefined): OrderParts {
  if (!orderId) return { userId: null, planId: null };

  const compact = orderId.match(COMPACT_ORDER_ID_PATTERN);
  if (compact) {
    const hex = compact[1];
    const userId = [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
    const planCode = compact[2].toLowerCase() as keyof typeof MIDTRANS_ORDER_PLAN_IDS;
    return { userId, planId: MIDTRANS_ORDER_PLAN_IDS[planCode] ?? null };
  }

  const match = orderId.match(ORDER_ID_PATTERN);
  if (match) return { userId: match[1], planId: match[2] };
  const legacy = orderId.match(LEGACY_ORDER_PATTERN);
  return legacy ? { userId: legacy[1], planId: DEFAULT_PLAN_ID } : { userId: null, planId: null };
}

async function markProcessed(supabase: SupabaseClient, eventId: string): Promise<void> {
  const { error } = await supabase
    .from("billing_events")
    .update({ processed: true })
    .eq("provider_event_id", eventId);
  if (error) {
    console.error("[MidtransWebhook] Failed to mark event processed:", error);
  }
}

export async function POST(req: NextRequest) {
  let payload: MidtransNotificationPayload;
  try {
    payload = await req.json() as MidtransNotificationPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!verifyMidtransNotificationSignature(payload)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!payload.order_id || !payload.transaction_status) {
    return NextResponse.json({ error: "Missing transaction identifier" }, { status: 400 });
  }

  const eventId = `${payload.order_id}:${payload.transaction_status}`;
  const supabase = createAdminClient();

  // Atomic idempotency gate: the billing_events row (unique provider_event_id)
  // is the lock. If the insert races, the loser gets a unique violation.
  const { error: insertError } = await supabase.from("billing_events").insert({
    provider_event_id: eventId,
    user_id: parseOrderId(payload.order_id).userId ?? null,
    event_type: `midtrans.${payload.transaction_status}`,
    payload,
    processed: false,
  });

  if (insertError) {
    if (insertError.code === EVENT_UNIQUE_VIOLATION) {
      // Already logged once. Reprocess only if the previous attempt never
      // finished (processed=false), otherwise treat as a duplicate.
      const { data: existing } = await supabase
        .from("billing_events")
        .select("processed")
        .eq("provider_event_id", eventId)
        .maybeSingle();
      if (existing?.processed) {
        return NextResponse.json({ status: "ok", message: "Duplicate event" });
      }
    } else {
      console.error("[MidtransWebhook] Failed to log event:", insertError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  const { userId, planId } = parseOrderId(payload.order_id);
  if (!userId) {
    await markProcessed(supabase, eventId);
    return NextResponse.json({ status: "ok", message: "Event logged without user" });
  }

  const now = new Date();
  const paid =
    payload.transaction_status === "settlement" ||
    (payload.transaction_status === "capture" && payload.fraud_status !== "challenge");

  try {
    if (paid) {
      let plan: PlanRecord | null = planId ? await getActivePlanByAdmin(planId) : null;
      const usingFallbackPlan = plan === null;
      if (!plan) {
        // Unknown/inactive/legacy order -> conservative Basic fallback.
        plan = {
          id: planId ?? DEFAULT_PLAN_ID,
          tier: "basic",
          billing_cycle: "monthly",
          name: "Basic",
          price_idr: 49000,
          midtrans_product_id: "",
          is_active: true,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };
      }

      // Verify amount + currency ONLY for catalog plans (a fallback price cannot
      // be trusted, and legacy orders predate the catalog). A mismatch means the
      // notification does not correspond to the plan we would activate — reject
      // it so a user is never silently granted the wrong entitlement.
      if (!usingFallbackPlan) {
        const gross = Number(payload.gross_amount);
        const currency = String(payload.currency ?? "IDR");
        if (currency !== "IDR" || gross !== Number(plan.price_idr)) {
          console.error(
            `[MidtransWebhook] Amount/currency mismatch for ${payload.order_id}: ` +
              `expected ${plan.price_idr} IDR, got ${gross} ${currency}`,
          );
          await markProcessed(supabase, eventId);
          return NextResponse.json({ status: "ok", message: "Amount mismatch, event rejected" });
        }
      }

      const durationDays = PERIOD_DAYS[plan.billing_cycle];

      // Renewal extends from the current period end when it is still in the future.
      const { data: current, error: currentError } = await supabase
        .from("subscriptions")
        .select("expires_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (currentError) {
        console.error("[MidtransWebhook] Failed to read current subscription:", currentError);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }

      const currentExpiry = current?.expires_at ? new Date(current.expires_at as string) : null;
      const periodBase = currentExpiry && currentExpiry > now ? currentExpiry : now;
      const expiresAt = new Date(periodBase.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const { error: upsertError } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "active",
          plan_id: plan.id,
          billing_cycle: plan.billing_cycle,
          plan_snapshot: toPlanSnapshot(plan),
          current_period_start: now.toISOString(),
          expires_at: expiresAt,
          current_period_end: expiresAt,
          cancel_at_period_end: false,
          provider_order_id: payload.order_id,
          provider_transaction_id: payload.transaction_id ?? null,
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (upsertError) {
        console.error("[MidtransWebhook] Failed to activate subscription:", upsertError);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    } else if (payload.transaction_status === "expire") {
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "grace_period",
          provider_order_id: payload.order_id,
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) {
        console.error("[MidtransWebhook] Failed to set grace period:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    } else if (["cancel", "deny"].includes(payload.transaction_status || "")) {
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "canceled",
          provider_order_id: payload.order_id,
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) {
        console.error("[MidtransWebhook] Failed to cancel subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }

      const res = await softUnpublishUserProjects(userId);
      if (!res.success) {
        // Subscription state is already persisted; surface the unpublish failure
        // loudly so it can be reconciled (soft-unpublish is safe to re-run).
        console.error(`[MidtransWebhook] Soft-unpublish failed for ${userId}:`, res.error);
      }
    }
  } catch (err) {
    console.error("[MidtransWebhook Error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  await markProcessed(supabase, eventId);
  return NextResponse.json({ status: "ok" });
}
