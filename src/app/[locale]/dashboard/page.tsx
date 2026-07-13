import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { CtaButton } from "@/components/ui/CtaButton";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("Dashboard");

  return (
    <AuthCard eyebrow={t("title")} title={t("loggedInAs")} subtitle={email}>
      <div className="flex flex-col gap-4">
        <CtaButton label={t("editData")} href="/dashboard/data" />
        <CtaButton label={t("chooseTemplate")} href="/dashboard/template" variant="secondary" />
        <form action={signOutAction}>
          <SubmitButton label={t("logout")} pendingLabel={t("logout")} />
        </form>
      </div>
    </AuthCard>
  );
}
