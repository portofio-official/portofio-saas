import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMidtransNotificationSignature } from "@/lib/billing/midtrans";
import { softUnpublishUserProjects } from "@/lib/billing/unpublish";
import type { MidtransNotificationPayload } from "@/lib/billing/types";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as MidtransNotificationPayload;
    if (!verifyMidtransNotificationSignature(payload)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = payload.transaction_id || payload.order_id;
    if (!eventId || !payload.order_id) {
      return NextResponse.json({ error: "Missing transaction identifier" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: existingEvent } = await supabase
      .from("billing_events").select("id").eq("provider_event_id", eventId).maybeSingle();
    if (existingEvent) return NextResponse.json({ status: "ok", message: "Duplicate event" });

    const match = payload.order_id.match(/^sub_([0-9a-f-]{36})_\d+$/i);
    const userId = match?.[1];
    const eventType = `midtrans.${payload.transaction_status || "unknown"}`;
    await supabase.from("billing_events").insert({
      provider_event_id: eventId,
      user_id: userId || null,
      event_type: eventType,
      payload,
    });

    if (!userId) return NextResponse.json({ status: "ok", message: "Event logged without user" });

    const now = new Date();
    const paid = payload.transaction_status === "settlement"
      || (payload.transaction_status === "capture" && payload.fraud_status !== "challenge");

    if (paid) {
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("subscriptions").upsert({
        user_id: userId, status: "active", expires_at: expiresAt, current_period_end: expiresAt,
        updated_at: now.toISOString(),
      }, { onConflict: "user_id" });
    } else if (payload.transaction_status === "expire") {
      await supabase.from("subscriptions").upsert({
        user_id: userId, status: "grace_period", updated_at: now.toISOString(),
      }, { onConflict: "user_id" });
    } else if (["cancel", "deny"].includes(payload.transaction_status || "")) {
      await supabase.from("subscriptions").upsert({
        user_id: userId, status: "canceled", updated_at: now.toISOString(),
      }, { onConflict: "user_id" });
      await softUnpublishUserProjects(userId);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[MidtransWebhook Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
