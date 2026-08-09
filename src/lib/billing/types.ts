// Types for billing, subscriptions, and payment integrations.

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
