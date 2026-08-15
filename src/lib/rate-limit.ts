import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Durable fixed-window rate limiter backed by Postgres (public.rate_limits +
 * public.rate_limit_check RPC). Safe on serverless multi-instance and survives
 * cold starts — unlike the previous in-memory Map.
 *
 * Fails OPEN (allows the request) when the limiter cannot be reached, so a
 * transient DB error never locks legitimate users out. The database is the same
 * store the whole app depends on, so a real outage is visible anyway.
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("rate_limit_check", {
      p_key: identifier,
      p_max: maxRequests,
      p_window_ms: windowMs,
    });

    if (error) {
      console.error("[RateLimit] check failed, allowing request:", error);
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const row = Array.isArray(data) ? data[0] : undefined;
    if (!row || typeof row.allowed !== "boolean") {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    return {
      allowed: row.allowed,
      retryAfterSeconds: Number(row.retry_after_seconds) || 0,
    };
  } catch (err) {
    console.error("[RateLimit] unexpected error, allowing request:", err);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Best-effort cleanup of stale rate-limit rows. Called from the daily cron so
 * identifiers that are never reused again do not accumulate forever.
 */
export async function cleanupRateLimits(retentionHours = 24): Promise<number> {
  try {
    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("rate_limits")
      .delete({ count: "exact" })
      .lt("updated_at", cutoff)
      .select("key");
    if (error) {
      console.error("[RateLimit] cleanup failed:", error);
      return 0;
    }
    return data?.length ?? 0;
  } catch (err) {
    console.error("[RateLimit] cleanup unexpected error:", err);
    return 0;
  }
}
