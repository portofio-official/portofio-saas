import { createHash, timingSafeEqual } from "node:crypto";
import type { PlanRecord } from "./types";

export const MIDTRANS_ORDER_PLAN_CODES = {
  "basic-monthly": "bm",
  "basic-annual": "ba",
  "premium-monthly": "pm",
  "premium-annual": "pa",
  "enterprise-monthly": "em",
  "enterprise-annual": "ea",
} as const;

export const MIDTRANS_ORDER_PLAN_IDS = {
  bm: "basic-monthly",
  ba: "basic-annual",
  pm: "premium-monthly",
  pa: "premium-annual",
  em: "enterprise-monthly",
  ea: "enterprise-annual",
} as const;

function midtransApiBase(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

export function verifyMidtransNotificationSignature(payload: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !payload.order_id || !payload.status_code || !payload.gross_amount || !payload.signature_key) {
    return false;
  }

  const expected = createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest("hex");
  const received = payload.signature_key.toLowerCase();

  return expected.length === received.length
    && timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function createMidtransTransaction(params: {
  userId: string;
  email: string;
  finishRedirectUrl: string;
  plan: PlanRecord;
}): Promise<{ redirectUrl: string; orderId: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const planCode = MIDTRANS_ORDER_PLAN_CODES[params.plan.id as keyof typeof MIDTRANS_ORDER_PLAN_CODES];
  if (!planCode) throw new Error(`Unsupported Midtrans plan: ${params.plan.id}`);

  // Midtrans limits order_id to 50 characters. Compact the UUID and plan id
  // while retaining enough information for webhook subscription resolution.
  const orderId = `sub_${params.userId.replaceAll("-", "")}_${planCode}_${Date.now().toString(36)}`;

  if (!serverKey) {
    console.warn("[Midtrans] MIDTRANS_SERVER_KEY is not configured; returning the development checkout URL.");
    return {
      redirectUrl: `/dashboard/billing?billing_stub=true&order_id=${orderId}&plan=${params.plan.id}`,
      orderId,
    };
  }

  const cycleLabel = params.plan.billing_cycle === "annual" ? "annual" : "monthly";
  const response = await fetch(`${midtransApiBase()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: params.plan.price_idr,
      },
      item_details: [{
        id: params.plan.midtrans_product_id,
        price: params.plan.price_idr,
        quantity: 1,
        name: `Portofio ${params.plan.name} (${cycleLabel})`,
      }],
      customer_details: { email: params.email },
      callbacks: { finish: params.finishRedirectUrl },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Midtrans API Error]", response.status, errorBody);
    throw new Error(`Midtrans API returned status ${response.status}`);
  }

  const data = await response.json() as { redirect_url?: string };
  if (!data.redirect_url) throw new Error("Midtrans API did not return a redirect URL");
  return { redirectUrl: data.redirect_url, orderId };
}
