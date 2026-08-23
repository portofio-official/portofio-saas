import { getTranslations } from "next-intl/server";
import { getUsersAction, getAdminAuditLogsAction } from "@/lib/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOverviewClientView, type OverviewMetric } from "@/components/admin/AdminOverviewClientView";
import { GridFour } from "@phosphor-icons/react/dist/ssr";

const DAY_MS = 24 * 60 * 60 * 1000;

function countSince(users: { createdAt: string }[], days: number): number {
  const cutoff = Date.now() - days * DAY_MS;
  return users.filter((u) => new Date(u.createdAt).getTime() >= cutoff).length;
}

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, users, logs] = await Promise.all([
    getTranslations("Admin"),
    getUsersAction(),
    getAdminAuditLogsAction(),
  ]);

  const roleCounts = users.reduce(
    (acc, u) => {
      const role = u.role === "admin" || u.role === "designer" ? u.role : "user";
      acc[role] += 1;
      return acc;
    },
    { admin: 0, designer: 0, user: 0 },
  );

  const total: OverviewMetric = { key: "users", label: t("overview.statTotal"), value: users.length };
  const companions: OverviewMetric[] = [
    { key: "userPlus", label: t("overview.statNew7d"), value: countSince(users, 7) },
    { key: "calendar", label: t("overview.statNew30d"), value: countSince(users, 30) },
  ];
  const roles: OverviewMetric[] = [
    { key: "shield", label: t("overview.statAdmins"), value: roleCounts.admin },
    { key: "palette", label: t("overview.statDesigners"), value: roleCounts.designer },
    { key: "userCircle", label: t("overview.statUsers"), value: roleCounts.user },
  ];

  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const recentLogs = logs.slice(0, 5).map((log) => ({
    id: log.id,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    timeLabel: formatter.format(new Date(log.createdAt)),
  }));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminPageHeader
        icon={GridFour}
        eyebrow={t("eyebrow")}
        title={t("overview.title")}
        subtitle={t("overview.subtitle")}
      />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <AdminOverviewClientView
          total={total}
          companions={companions}
          roles={roles}
          recentLogs={recentLogs}
          emptyLabel={t("audit.empty")}
          recentActivityLabel={t("overview.recentActivity")}
          viewAllLabel={t("overview.viewAll")}
        />
      </div>
    </div>
  );
}
