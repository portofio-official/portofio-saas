import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getSubscriptionState } from "@/lib/billing/subscription";
import { BillingClientView } from "@/components/dashboard/BillingClientView";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const subscriptionState = await getSubscriptionState();

  return (
    <BillingClientView
      status={subscriptionState.status}
      isActive={subscriptionState.isActive}
      isGracePeriod={subscriptionState.isGracePeriod}
      expiresAt={subscriptionState.expiresAt?.toISOString() ?? null}
      daysRemainingInGracePeriod={subscriptionState.daysRemainingInGracePeriod}
    />
  );
}
