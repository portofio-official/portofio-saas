import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUsersAction, getAdminAuditLogsAction } from "@/lib/admin";
import { PageHeader } from "@/components/ui/PageHeader";

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

  const new7d = countSince(users, 7);
  const new30d = countSince(users, 30);
  const roleCounts = users.reduce(
    (acc, u) => {
      const role = u.role === "admin" || u.role === "designer" ? u.role : "user";
      acc[role] += 1;
      return acc;
    },
    { admin: 0, designer: 0, user: 0 },
  );

  const statCards = [
    { label: t("overview.statTotal"), value: users.length, icon: "group", tone: true },
    { label: t("overview.statNew7d"), value: new7d, icon: "person_add" },
    { label: t("overview.statNew30d"), value: new30d, icon: "calendar_month" },
    { label: t("overview.statAdmins"), value: roleCounts.admin, icon: "shield" },
    { label: t("overview.statDesigners"), value: roleCounts.designer, icon: "palette" },
    { label: t("overview.statUsers"), value: roleCounts.user, icon: "person" },
  ];

  const recentLogs = logs.slice(0, 5);
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("overview.title")}
        subtitle={t("overview.subtitle")}
      />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-surface p-4.5 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[20px] text-ink-faint">{card.icon}</span>
                {card.tone ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
              </div>
              <p
                className={`mt-3 font-display text-[26px] font-bold leading-none tracking-tight tabular-nums ${
                  card.tone ? "text-accent-deep" : "text-ink"
                }`}
              >
                {card.value}
              </p>
              <p className="mt-1.5 text-[12px] font-medium text-ink-faint">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[15px] font-bold text-ink">{t("overview.recentActivity")}</p>
            <Link
              href="/admin/audit-log"
              className="text-[13px] font-semibold text-accent-deep transition-colors hover:text-accent"
            >
              {t("overview.viewAll")}
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="mt-6 text-center text-[13px] font-medium text-ink-soft">{t("audit.empty")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">{log.action}</p>
                    <p className="truncate text-[12px] text-ink-soft">
                      {log.targetType}
                      {log.targetId ? ` · ${log.targetId}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-faint">{formatter.format(new Date(log.createdAt))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
