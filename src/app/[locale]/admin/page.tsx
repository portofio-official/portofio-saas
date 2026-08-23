import { getTranslations } from "next-intl/server";
import {
  getUsersAction,
  getAdminAuditLogsAction,
  getAdminAttentionSummaryAction,
} from "@/lib/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOverviewClientView } from "@/components/admin/AdminOverviewClientView";
import { buildUserLabelMap, getActivityTone, describeActivity, dedupeConsecutive, timeAgo } from "@/components/admin/activity";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

function countInWindow(users: { createdAt: string }[], startDaysAgo: number, endDaysAgo: number): number {
  const now = Date.now();
  return users.filter((u) => {
    const age = now - new Date(u.createdAt).getTime();
    return age >= endDaysAgo * DAY_MS && age < startDaysAgo * DAY_MS;
  }).length;
}

function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function filterLogsInRange<T extends { createdAt: string }>(logs: T[], days: number): T[] {
  const now = Date.now();
  return logs.filter((log) => now - new Date(log.createdAt).getTime() <= days * DAY_MS);
}

function dailyBuckets(users: { createdAt: string }[], days: number): number[] {
  const buckets = new Array(days).fill(0);
  const now = Date.now();
  for (const u of users) {
    const diffDays = Math.floor((now - new Date(u.createdAt).getTime()) / DAY_MS);
    if (diffDays >= 0 && diffDays < days) {
      buckets[days - 1 - diffDays] += 1;
    }
  }
  return buckets;
}

export default async function AdminOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale } = await params;
  const { range: rangeParam } = await searchParams;
  const range = rangeParam && rangeParam in RANGE_DAYS ? rangeParam : "30d";
  const rangeDays = RANGE_DAYS[range];

  const [t, users, logs, attention] = await Promise.all([
    getTranslations("Admin"),
    getUsersAction(),
    getAdminAuditLogsAction(),
    getAdminAttentionSummaryAction(),
  ]);

  const roleCounts = users.reduce(
    (acc, u) => {
      const role = u.role === "admin" || u.role === "designer" ? u.role : "user";
      acc[role] += 1;
      return acc;
    },
    { admin: 0, designer: 0, user: 0 },
  );

  const new7 = countInWindow(users, 7, 0);
  const prev7 = countInWindow(users, 14, 7);
  const new30 = countInWindow(users, 30, 0);
  const prev30 = countInWindow(users, 60, 30);

  const labels = buildUserLabelMap(users);
  const inRangeLogs = filterLogsInRange(logs, rangeDays);
  const deduped = dedupeConsecutive(inRangeLogs);
  const activity = deduped.slice(0, 40).map((log) => {
    const { actorLabel, text, target } = describeActivity(log, labels, t);
    return {
      id: log.id,
      action: log.action,
      tone: getActivityTone(log.action, log.metadata),
      actorLabel,
      text,
      target,
      count: log.count,
      timeLabel: timeAgo(log.createdAt, locale),
      timeTitle: new Date(log.createdAt).toISOString(),
    };
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminPageHeader title={t("overview.title")} subtitle={t("overview.subtitle")} />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <AdminOverviewClientView
          total={users.length}
          composition={[
            { label: t("overview.statAdmins"), value: roleCounts.admin, className: "bg-admin-ink" },
            { label: t("overview.statDesigners"), value: roleCounts.designer, className: "bg-admin-primary" },
            { label: t("overview.statUsers"), value: roleCounts.user, className: "bg-admin-ink/25" },
          ]}
          pulse={dailyBuckets(users, 30)}
          new7={new7}
          delta7={delta(new7, prev7)}
          new30={new30}
          delta30={delta(new30, prev30)}
          attention={attention}
          activity={activity}
          range={range}
        />
      </div>
    </div>
  );
}
