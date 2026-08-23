import { getTranslations } from "next-intl/server";
import { getAdminAuditLogsAction, getUsersAction } from "@/lib/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard, AdminEmptyState, ActivityRow } from "@/components/admin/primitives";
import { buildUserLabelMap, getActivityTone, describeActivity, dedupeConsecutive, timeAgo } from "@/components/admin/activity";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

function filterLogsInRange<T extends { createdAt: string }>(logs: T[], days: number): T[] {
  const now = Date.now();
  return logs.filter((log) => now - new Date(log.createdAt).getTime() <= days * DAY_MS);
}

export default async function AdminAuditLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale } = await params;
  const { range: rangeParam } = await searchParams;
  const range = rangeParam && rangeParam in RANGE_DAYS ? rangeParam : "30d";

  const [t, logs, users] = await Promise.all([
    getTranslations("Admin"),
    getAdminAuditLogsAction(),
    getUsersAction(),
  ]);

  const labels = buildUserLabelMap(users);
  const inRange = filterLogsInRange(logs, RANGE_DAYS[range]);
  const deduped = dedupeConsecutive(inRange);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminPageHeader title={t("audit.title")} subtitle={t("audit.subtitle")} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <AdminCard className="p-5">
          {deduped.length === 0 ? (
            <AdminEmptyState
              icon={ClockCounterClockwise}
              title={t("activity.emptyTitle")}
              hint={t("activity.emptyHint", { range: t(`timeRange.${range}`) })}
            />
          ) : (
            <ul className="divide-y divide-admin-border">
              {deduped.map((log) => {
                const { actorLabel, text, target } = describeActivity(log, labels, t);
                return (
                  <ActivityRow
                    key={log.id}
                    tone={getActivityTone(log.action, log.metadata)}
                    text={text}
                    target={target ?? undefined}
                    actorLabel={actorLabel}
                    timeLabel={timeAgo(log.createdAt, locale)}
                    timeTitle={new Date(log.createdAt).toISOString()}
                    countBadge={log.count}
                  />
                );
              })}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
