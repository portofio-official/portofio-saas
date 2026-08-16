// Types for billing, subscriptions, and payment integrations.

export type PlanTier = "basic" | "premium" | "enterprise";

export type BillingCycle = "monthly" | "annual";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "grace_period"
  | "expired"
  | "canceled";

export interface PlanRecord {
  id: string;
  tier: PlanTier;
  billing_cycle: BillingCycle;
  name: string;
  price_idr: number;
  midtrans_product_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanSnapshot {
  tier: PlanTier;
  name: string;
  billing_cycle: BillingCycle;
  price_idr: number;
}

export interface Entitlements {
  tier: PlanTier;
  max_live_websites: number;
  publish_subdomain: boolean;
  custom_domain: boolean;
  watermark: boolean;
  advanced_analytics: boolean;
  priority_support: boolean;
  premium_templates: boolean;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan_id: string | null;
  billing_cycle: BillingCycle | null;
  plan_snapshot: PlanSnapshot | null;
  current_period_start: string | null;
  current_period_end: string | null;
  expires_at: string | null;
  cancel_at_period_end: boolean;
  provider_order_id: string | null;
  provider_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStateDetails {
  isActive: boolean;
  status: SubscriptionStatus;
  isGracePeriod: boolean;
  expiresAt: Date | null;
  planId?: string | null;
  planName?: string | null;
  billingCycle?: BillingCycle | null;
  daysRemainingInGracePeriod?: number;
}

export interface MidtransNotificationPayload {
  order_id?: string;
  transaction_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  settlement_time?: string;
  [key: string]: unknown;
}
