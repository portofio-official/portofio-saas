"use server";

import { createClient } from "@/lib/supabase/server";
import { createXenditInvoice } from "./xendit";
import { getSubscriptionState } from "./subscription";

export async function createCheckoutInvoiceAction(): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: "Authentication required to checkout" };
    }

    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "http://localhost:3000";
    const successRedirectUrl = `${domain}/dashboard?checkout=success`;
    const failureRedirectUrl = `${domain}/dashboard?checkout=failed`;

    const { invoiceUrl } = await createXenditInvoice({
      userId: user.id,
      email: user.email,
      successRedirectUrl,
      failureRedirectUrl,
    });

    return { url: invoiceUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initiate checkout";
    return { error: message };
  }
}

export async function getSubscriptionStatusAction() {
  return await getSubscriptionState();
}
