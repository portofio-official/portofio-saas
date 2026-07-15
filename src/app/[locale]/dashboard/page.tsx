import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listWorkspaces } from "@/lib/workspace/queries";
import { DashboardClientView } from "@/components/dashboard/DashboardClientView";

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

  const [workspaces, t] = await Promise.all([listWorkspaces(), getTranslations("Workspace")]);

  return (
    <DashboardClientView
      email={email}
      workspaces={workspaces}
      dict={{
        eyebrow: t("eyebrow"),
        title: t("title"),
        logout: t("logout"),
        listEyebrow: t("listEyebrow"),
        listTitle: t("listTitle"),
        createEyebrow: t("create.eyebrow"),
        createTitleFirst: t("create.titleFirst"),
        createTitle: t("create.title"),
      }}
    />
  );
}
