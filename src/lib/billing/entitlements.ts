import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Entitlements, PlanTier } from "./types";

const TIER_RANK: Record<PlanTier, number> = { basic: 0, premium: 1, enterprise: 2 };

/** True when `tier` unlocks at least everything `minimum` requires. */
export function tierMeetsMinimum(tier: PlanTier, minimum: PlanTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minimum];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Entitlements | null {
  if (!row) return null;
  return {
    tier: row.tier,
    max_live_websites: row.max_live_websites,
    publish_subdomain: row.publish_subdomain,
    custom_domain: row.custom_domain,
    watermark: row.watermark,
    advanced_analytics: row.advanced_analytics,
    priority_support: row.priority_support,
    premium_templates: row.premium_templates,
  };
}

/**
 * The caller's own entitlements (RLS-scoped request client). Use from
 * dashboard/editor server actions where "my own plan" is what's needed.
 * Returns null for a free account (no active/grace-period subscription).
 */
export async function getEntitlements(): Promise<Entitlements | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_entitlements");
  if (error) {
    console.error("[Entitlements] get_user_entitlements failed:", error);
    return null;
  }
  return mapRow(Array.isArray(data) ? data[0] : data);
}

/**
 * Another user's entitlements, resolved with the service-role client.
 * `get_user_entitlements` is SECURITY INVOKER — the RLS on `subscriptions`
 * only lets an owner read their own row, so resolving someone else's tier
 * (e.g. a site visitor needing the site OWNER's watermark entitlement)
 * requires the admin client. Narrowly scoped to this one read-only RPC —
 * never use this client for anything else in a public code path (PRD N4).
 */
export async function getEntitlementsByAdmin(targetUserId: string): Promise<Entitlements | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_user_entitlements", { target_user_id: targetUserId });
  if (error) {
    console.error("[Entitlements] get_user_entitlements (admin) failed:", error);
    return null;
  }
  return mapRow(Array.isArray(data) ? data[0] : data);
}

/** A template's minimum required tier. Defaults to "basic" (open) on any lookup failure. */
export async function getTemplateMinimumPlan(templateId: string): Promise<PlanTier> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("minimum_plan")
    .eq("id", templateId)
    .maybeSingle();
  return (data?.minimum_plan as PlanTier | undefined) ?? "basic";
}
