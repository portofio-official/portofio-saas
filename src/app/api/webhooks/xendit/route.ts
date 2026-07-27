import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyXenditWebhookSignature } from "@/lib/billing/xendit";
import { softUnpublishUserProjects } from "@/lib/billing/unpublish";
import { XenditWebhookPayload } from "@/lib/billing/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Signature Verification
    const callbackToken = req.headers.get("x-callback-token");
    
    // Enforce token check unless explicitly running dev without set env token
    if (process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN && !verifyXenditWebhookSignature(callbackToken)) {
      console.warn("[XenditWebhook] Unauthorized webhook request: Invalid x-callback-token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: XenditWebhookPayload = await req.json();
    const eventId = payload.id || payload.external_id;

    if (!eventId) {
      return NextResponse.json({ error: "Missing event identifier" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 2. Idempotency Check via billing_events table
    const { data: existingEvent } = await supabase
      .from("billing_events")
      .select("id")
      .eq("xendit_event_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      console.log(`[XenditWebhook] Duplicate event ${eventId} ignored (Idempotency OK)`);
      return NextResponse.json({ status: "ok", message: "Duplicate event already processed" });
    }

    // Extract user_id from external_id pattern: sub_<userId>_<timestamp>
    let userId = payload.user_id;
    if (!userId && payload.external_id && payload.external_id.startsWith("sub_")) {
      const parts = payload.external_id.split("_");
      if (parts.length >= 2) {
        userId = parts[1];
      }
    }

    const status = payload.status;
    const eventType = payload.event || (status ? `invoice.${status.toLowerCase()}` : "invoice.unknown");

    // 3. Log event into billing_events for audit trail & idempotency
    const { error: eventError } = await supabase.from("billing_events").insert({
      xendit_event_id: eventId,
      user_id: userId || null,
      event_type: eventType,
      payload: payload,
    });

    if (eventError) {
      console.error("[XenditWebhook] Failed to log billing_event:", eventError);
      // Continue processing even if audit log insert failed
    }

    if (!userId) {
      console.warn("[XenditWebhook] Could not determine user_id from payload:", payload);
      return NextResponse.json({ status: "ok", message: "Event logged but no user_id found" });
    }

    // 4. State Machine Operations
    const now = new Date();

    if (status === "PAID" || eventType === "invoice.paid" || eventType === "recurring.succeeded") {
      // 30 days subscription duration
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "active",
          expires_at: expiresAt,
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );

      console.log(`[XenditWebhook] Activated subscription for user ${userId} until ${expiresAt}`);
    } else if (status === "EXPIRED" || eventType === "invoice.expired") {
      // Mark as grace_period
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "grace_period",
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );

      console.log(`[XenditWebhook] Subscription for user ${userId} set to grace_period`);
    } else if (eventType === "subscription.canceled" || status === "CANCELED") {
      // Mark as canceled and perform reversible soft-unpublish
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "canceled",
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );

      await softUnpublishUserProjects(userId);
      console.log(`[XenditWebhook] Subscription for user ${userId} canceled; soft-unpublished projects`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[XenditWebhook Error]:", errorMsg);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
