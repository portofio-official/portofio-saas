import { createHash, timingSafeEqual } from "node:crypto";

export const SUBSCRIPTION_PLAN = {
  priceIdr: 49000,
  name: "Portofio Monthly Pro Subscription",
  durationDays: 30,
};

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
}): Promise<{ redirectUrl: string; orderId: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const orderId = `sub_${params.userId}_${Date.now()}`;

  if (!serverKey) {
    console.warn("[Midtrans] MIDTRANS_SERVER_KEY is not configured; returning the development checkout URL.");
    return {
      redirectUrl: `/dashboard/billing?billing_stub=true&order_id=${orderId}`,
      orderId,
    };
  }

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
        gross_amount: SUBSCRIPTION_PLAN.priceIdr,
      },
      item_details: [{
        id: "portofio-monthly",
        price: SUBSCRIPTION_PLAN.priceIdr,
        quantity: 1,
        name: SUBSCRIPTION_PLAN.name,
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
