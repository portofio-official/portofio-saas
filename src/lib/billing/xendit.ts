// Xendit REST API Integration Helpers

export const SUBSCRIPTION_PLAN = {
  priceIdr: 49000, // Rp 49.000 / month (single plan, no freemium)
  name: "Portofio Monthly Pro Subscription",
  durationDays: 30,
};

/**
 * Verify Xendit Webhook signature header `x-callback-token`.
 */
export function verifyXenditWebhookSignature(requestToken: string | null): boolean {
  const expectedToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
  if (!expectedToken) {
    // In dev/local mode if token is not set, log warning
    console.warn("[XenditWebhook] XENDIT_WEBHOOK_VERIFICATION_TOKEN is not set in environment.");
    return false;
  }
  return requestToken === expectedToken;
}

/**
 * Create a Xendit invoice for subscription checkout.
 * Returns the checkout invoice URL.
 */
export async function createXenditInvoice(params: {
  userId: string;
  email: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}): Promise<{ invoiceUrl: string; invoiceId: string }> {
  const apiKey = process.env.XENDIT_SECRET_KEY;
  const externalId = `sub_${params.userId}_${Date.now()}`;

  if (!apiKey) {
    // Dev stub fallback if XENDIT_SECRET_KEY is not configured yet
    console.warn("[Xendit] XENDIT_SECRET_KEY not found in environment, returning stub checkout URL.");
    return {
      invoiceUrl: `/dashboard/billing?billing_stub=true&external_id=${externalId}`,
      invoiceId: `stub_inv_${Date.now()}`,
    };
  }

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      external_id: externalId,
      amount: SUBSCRIPTION_PLAN.priceIdr,
      payer_email: params.email,
      description: SUBSCRIPTION_PLAN.name,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: "IDR",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Xendit API Error]:", response.status, errorBody);
    throw new Error(`Xendit API returned status ${response.status}`);
  }

  const data = await response.json();
  return {
    invoiceUrl: data.invoice_url,
    invoiceId: data.id,
  };
}
