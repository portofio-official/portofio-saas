import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listWorkspaces } from "@/lib/workspace/queries";
import { getRecentViewsByWorkspace } from "@/lib/analytics/store";
import { DashboardClientView } from "@/components/dashboard/DashboardClientView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return { title: t("title") };
}

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

  const workspaces = await listWorkspaces();

  if (workspaces.length === 0) {
    return redirect({ href: "/onboarding", locale });
  }

  const recentViews = await getRecentViewsByWorkspace(workspaces.map((w) => w.id));

  return (
    <DashboardClientView
      workspaces={workspaces}
      recentViews={recentViews}
    />
  );
}
