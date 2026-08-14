import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listWorkspaces } from "@/lib/workspace/queries";
import { getRecentViewsByWorkspace } from "@/lib/analytics/store";
import { DashboardClientView } from "@/components/dashboard/DashboardClientView";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();
  const cookieStore = await cookies();
  const preferredTemplateId = cookieStore.get("preferredTemplateId")?.value;

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const [workspaces, t] = await Promise.all([listWorkspaces(), getTranslations("Workspace")]);

  if (workspaces.length === 0) {
    return redirect({ href: "/onboarding", locale });
  }

  const recentViews = await getRecentViewsByWorkspace(workspaces.map((w) => w.id));

  return (
    <DashboardClientView
      email={email}
      workspaces={workspaces}
      recentViews={recentViews}
      preferredTemplateId={preferredTemplateId}
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
