import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getSubscriptionState } from "@/lib/billing/subscription";
import { listActivePlans } from "@/lib/billing/plans";
import { BillingClientView } from "@/components/dashboard/BillingClientView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Billing" });
  return { title: t("title") };
}

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkout?: string; billing_stub?: string }>;
}) {
  const { locale } = await params;
  const { checkout, billing_stub } = await searchParams;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  let checkoutNotice: "success" | "failed" | "stub" | null = null;
  if (checkout === "success") checkoutNotice = "success";
  else if (checkout === "failed") checkoutNotice = "failed";
  else if (billing_stub === "true") checkoutNotice = "stub";

  const subscriptionState = await getSubscriptionState();
  const plans = await listActivePlans();

  return (
    <BillingClientView
      status={subscriptionState.status}
      isActive={subscriptionState.isActive}
      isGracePeriod={subscriptionState.isGracePeriod}
      expiresAt={subscriptionState.expiresAt?.toISOString() ?? null}
      planId={subscriptionState.planId ?? null}
      planName={subscriptionState.planName ?? null}
      billingCycle={subscriptionState.billingCycle ?? null}
      daysRemainingInGracePeriod={subscriptionState.daysRemainingInGracePeriod}
      checkoutNotice={checkoutNotice}
      plans={plans}
    />
  );
}
