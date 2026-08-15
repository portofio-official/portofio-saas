import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingCycle, PlanRecord, PlanSnapshot } from "./types";

// The authoritative plan catalog lives in the `plans` table (seeded by
// supabase/migrations/20260814000000_tiered_billing.sql) so webhooks, audit,
// and price changes stay traceable. This module only defines the stable ids.

export const PLAN_IDS = {
  basicMonthly: "basic-monthly",
  basicAnnual: "basic-annual",
  premiumMonthly: "premium-monthly",
  premiumAnnual: "premium-annual",
  enterpriseMonthly: "enterprise-monthly",
  enterpriseAnnual: "enterprise-annual",
} as const;

export const DEFAULT_PLAN_ID = PLAN_IDS.basicMonthly;

export const PERIOD_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  annual: 365,
};

function mapRow(row: unknown): PlanRecord | null {
  if (!row) return null;
  const r = row as Record<string, unknown>;
  if (
    typeof r.id !== "string" ||
    typeof r.name !== "string" ||
    typeof r.price_idr !== "number" ||
    typeof r.midtrans_product_id !== "string"
  ) {
    return null;
  }
  return {
    id: r.id,
    tier: r.tier as PlanRecord["tier"],
    billing_cycle: r.billing_cycle as BillingCycle,
    name: r.name,
    price_idr: r.price_idr,
    midtrans_product_id: r.midtrans_product_id,
    is_active: r.is_active !== false,
    created_at: typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
    updated_at: typeof r.updated_at === "string" ? r.updated_at : new Date().toISOString(),
  };
}

export function toPlanSnapshot(plan: PlanRecord): PlanSnapshot {
  return {
    tier: plan.tier,
    name: plan.name,
    billing_cycle: plan.billing_cycle,
    price_idr: plan.price_idr,
  };
}

/** Server-side: list active plans for the billing UI (RLS read via request client). */
export async function listActivePlans(): Promise<PlanRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("id, tier, billing_cycle, name, price_idr, midtrans_product_id, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("price_idr", { ascending: true });

  return (data ?? []).map(mapRow).filter((p): p is PlanRecord => p !== null);
}

/** Server-side: fetch a single active plan. Returns null when unknown/inactive. */
export async function getActivePlan(planId: string): Promise<PlanRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("id, tier, billing_cycle, name, price_idr, midtrans_product_id, is_active, created_at, updated_at")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();

  return mapRow(data);
}

/** Service-role lookup (webhook context, no user session). Returns null when unknown/inactive. */
export async function getActivePlanByAdmin(planId: string): Promise<PlanRecord | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("plans")
    .select("id, tier, billing_cycle, name, price_idr, midtrans_product_id, is_active, created_at, updated_at")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();

  return mapRow(data);
}
