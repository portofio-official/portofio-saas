import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { softUnpublishUserProjects } from "@/lib/billing/unpublish";
import { cleanupRateLimits } from "@/lib/rate-limit";
import { cleanupOldAnalytics } from "@/lib/analytics/store";

const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

// Fail closed: production REQUIRES CRON_SECRET. Without it the endpoint never
// runs (503). Local/dev still works without a secret for manual testing.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const expected = `Bearer ${secret}`;
  const provided = request.headers.get("authorization") ?? "";
  if (provided.length !== expected.length) return false;

  // Constant-time comparison to avoid leaking the secret via timing.
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    const missingSecret = !process.env.CRON_SECRET && process.env.NODE_ENV === "production";
    return NextResponse.json(
      { error: missingSecret ? "CRON_SECRET is not configured" : "Unauthorized cron execution" },
      { status: missingSecret ? 503 : 401 },
    );
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const nowMs = Date.now();

    let processedCount = 0;
    let unpublishedTotal = 0;

    // 1. Active subscriptions past their period either enter the grace period
    //    (unintentional non-renewal — site stays live, getSubscriptionState
    //    mirrors this) or, if the user explicitly cancelled, expire straight
    //    to `canceled` with an immediate soft-unpublish — a cancelled period
    //    shouldn't get a 7-day grace window meant for accidental lapses.
    const { data: expiredActive, error: expiredActiveError } = await supabase
      .from("subscriptions")
      .select("user_id, cancel_at_period_end")
      .eq("status", "active")
      .lt("expires_at", now);

    if (expiredActiveError) {
      console.error("[CronCheckSubscriptions] Failed to read expired active subscriptions:", expiredActiveError);
      return NextResponse.json({ error: expiredActiveError.message }, { status: 500 });
    }

    const graceUserIds = (expiredActive ?? [])
      .filter((s) => !s.cancel_at_period_end)
      .map((s) => s.user_id);
    const cancelUserIds = (expiredActive ?? [])
      .filter((s) => s.cancel_at_period_end)
      .map((s) => s.user_id);

    let enteredGraceCount = 0;
    if (graceUserIds.length > 0) {
      const { data: enteredGrace, error: graceError } = await supabase
        .from("subscriptions")
        .update({ status: "grace_period", updated_at: now })
        .in("user_id", graceUserIds)
        .select("id");

      if (graceError) {
        console.error("[CronCheckSubscriptions] Failed to move expired subscriptions into grace:", graceError);
        return NextResponse.json({ error: graceError.message }, { status: 500 });
      }
      enteredGraceCount = enteredGrace?.length ?? 0;
    }

    let canceledAtPeriodEndCount = 0;
    for (const userId of cancelUserIds) {
      const res = await softUnpublishUserProjects(userId);
      if (!res.success) {
        console.error(`[CronCheckSubscriptions] Soft-unpublish failed for cancelled user ${userId}:`, res.error);
        continue;
      }
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: now })
        .eq("user_id", userId);
      if (updateError) {
        console.error(`[CronCheckSubscriptions] Failed to mark cancelled user ${userId} canceled:`, updateError);
        continue;
      }
      canceledAtPeriodEndCount++;
      unpublishedTotal += res.unpublishedCount;
    }

    // 2. Grace-period subscriptions whose 7-day window has fully lapsed get
    //    expired and their published sites soft-unpublished (data is kept).
    //    Rows are moved to `expired`, so this step is naturally idempotent.
    const { data: graceSubs, error } = await supabase
      .from("subscriptions")
      .select("user_id, expires_at")
      .eq("status", "grace_period")
      .lt("expires_at", now);

    if (error) {
      console.error("[CronCheckSubscriptions] Failed to fetch grace-period subs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const sub of graceSubs ?? []) {
      if (!sub.expires_at) continue;
      const expiresAt = new Date(sub.expires_at as string).getTime();
      if (nowMs <= expiresAt + GRACE_PERIOD_MS) continue;

      const res = await softUnpublishUserProjects(sub.user_id);
      if (res.success) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ status: "expired", updated_at: now })
          .eq("user_id", sub.user_id);
        if (updateError) {
          console.error(`[CronCheckSubscriptions] Failed to mark user ${sub.user_id} expired:`, updateError);
          continue;
        }
        processedCount++;
        unpublishedTotal += res.unpublishedCount;
      }
    }

    // 3. Best-effort cleanup of stale rate-limit rows (never blocks the rest).
    let cleanedRateLimits = 0;
    try {
      cleanedRateLimits = await cleanupRateLimits(24);
    } catch (err) {
      console.error("[CronCheckSubscriptions] Rate-limit cleanup failed:", err);
    }

    // 4. Best-effort retention cleanup for analytics tables (never blocks the rest).
    let cleanedAnalytics = { visits: 0, sectionVisits: 0 };
    try {
      cleanedAnalytics = await cleanupOldAnalytics();
    } catch (err) {
      console.error("[CronCheckSubscriptions] Analytics cleanup failed:", err);
    }

    return NextResponse.json({
      success: true,
      enteredGraceUsers: enteredGraceCount,
      canceledAtPeriodEndUsers: canceledAtPeriodEndCount,
      processedUsers: processedCount,
      unpublishedSitesTotal: unpublishedTotal,
      cleanedRateLimitRows: cleanedRateLimits,
      cleanedAnalyticsRows: cleanedAnalytics,
      timestamp: now,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CronCheckSubscriptions] Unexpected error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
