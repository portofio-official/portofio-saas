import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { softUnpublishUserProjects } from "@/lib/billing/unpublish";

export async function GET(request: Request) {
  // Authorization check for Cron header/token if configured
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Query active subscriptions that have passed expires_at and 7-day grace period
    const { data: expiredSubs, error } = await supabase
      .from("subscriptions")
      .select("user_id, status, expires_at")
      .or("status.eq.expired,status.eq.canceled,status.eq.grace_period")
      .lt("expires_at", now);

    if (error) {
      console.error("[CronCheckSubscriptions] Failed to fetch expired subs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let processedCount = 0;
    let unpublishedTotal = 0;

    if (expiredSubs && expiredSubs.length > 0) {
      for (const sub of expiredSubs) {
        // Calculate grace period end (7 days past expires_at)
        const expiresAt = new Date(sub.expires_at).getTime();
        const graceEnd = expiresAt + 7 * 24 * 60 * 60 * 1000;

        if (Date.now() > graceEnd) {
          // Grace period lapsed -> auto-unpublish
          const res = await softUnpublishUserProjects(sub.user_id);
          if (res.success) {
            processedCount++;
            unpublishedTotal += res.unpublishedCount;

            // Mark sub as expired
            await supabase
              .from("subscriptions")
              .update({ status: "expired" })
              .eq("user_id", sub.user_id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers: processedCount,
      unpublishedSitesTotal: unpublishedTotal,
      timestamp: now,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CronCheckSubscriptions] Unexpected error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
