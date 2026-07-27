// Types for Billing, Subscriptions, and Xendit Integrations

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "grace_period"
  | "expired"
  | "canceled";

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStateDetails {
  isActive: boolean;
  status: SubscriptionStatus;
  isGracePeriod: boolean;
  expiresAt: Date | null;
  daysRemainingInGracePeriod?: number;
}

export interface XenditWebhookPayload {
  id?: string;
  event?: string;
  external_id?: string;
  amount?: number;
  status?: string;
  user_id?: string;
  payer_email?: string;
  description?: string;
  created?: string;
  updated?: string;
  paid_at?: string;
  [key: string]: unknown;
}
