import type { AdminAuditLogView } from "@/lib/admin/actions";

export type ActivityTone = "positive" | "amber" | "rose" | "neutral";

/**
 * Semantic weight per event, not just a color-by-category default — matches
 * the redesign brief's defect #8 ("warna tidak dipakai untuk hal berguna").
 * Destructive/restrictive = rose, reduces availability/needs review = amber,
 * restorative = positive, routine = neutral.
 */
export function getActivityTone(action: string, metadata: Record<string, unknown>): ActivityTone {
  switch (action) {
    case "user.suspension":
      return metadata.suspend === true ? "rose" : "positive";
    case "user.role_change":
      return "amber";
    case "template.visibility":
      return metadata.isActive === true ? "positive" : "amber";
    case "blocklist.add":
      return "neutral";
    case "blocklist.remove":
      return "amber";
    default:
      return "neutral";
  }
}

/** id -> display label (full name, falling back to email) for actor/target resolution. */
export type UserLabelMap = Map<string, string>;

export function buildUserLabelMap(users: { id: string; email: string; fullName: string | null }[]): UserLabelMap {
  return new Map(users.map((u) => [u.id, u.fullName || u.email]));
}

/**
 * Builds the human-readable sentence for one audit log row via next-intl's
 * translator, resolving actor/target ids to real names when available. Keys
 * live under Admin.activity.* in messages/{locale}.json — no hardcoded copy.
 */
export function describeActivity(
  log: Pick<AdminAuditLogView, "action" | "targetType" | "targetId" | "metadata" | "actorId">,
  labels: UserLabelMap,
  t: (key: string, values?: Record<string, string>) => string,
): { actorLabel: string; text: string; target: string | null } {
  const actorLabel = (log.actorId && labels.get(log.actorId)) || t("activity.unknownActor");
  const target = log.targetId ?? null;

  switch (log.action) {
    case "user.suspension": {
      const targetLabel = (target && labels.get(target)) || target || "";
      return {
        actorLabel,
        text: log.metadata.suspend === true ? t("activity.userSuspended") : t("activity.userReactivated"),
        target: targetLabel,
      };
    }
    case "user.role_change": {
      const targetLabel = (target && labels.get(target)) || target || "";
      const role = typeof log.metadata.role === "string" ? log.metadata.role : "";
      return { actorLabel, text: t("activity.userRoleChanged", { role }), target: targetLabel };
    }
    case "template.visibility":
      return {
        actorLabel,
        text: log.metadata.isActive === true ? t("activity.templateShown") : t("activity.templateHidden"),
        target,
      };
    case "blocklist.add":
      return { actorLabel, text: t("activity.blocklistAdded"), target };
    case "blocklist.remove":
      return { actorLabel, text: t("activity.blocklistRemoved"), target };
    default:
      return { actorLabel, text: t("activity.generic", { action: log.action }), target };
  }
}

const RTF_CACHE = new Map<string, Intl.RelativeTimeFormat>();

/** Pure, server-safe relative time formatter (no client boundary needed). */
export function timeAgo(dateInput: string, locale: string): string {
  let rtf = RTF_CACHE.get(locale);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    RTF_CACHE.set(locale, rtf);
  }
  const diffMs = new Date(dateInput).getTime() - Date.now();
  const secs = Math.round(diffMs / 1000);
  const mins = Math.round(secs / 60);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(months / 12);
  if (Math.abs(secs) < 60) return rtf.format(secs, "second");
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(years, "year");
}

/** Collapses consecutive identical (action+target) rows into one with a ×N badge. */
export function dedupeConsecutive<T extends { action: string; targetId: string | null }>(
  logs: T[],
): (T & { count: number })[] {
  const out: (T & { count: number })[] = [];
  for (const log of logs) {
    const last = out[out.length - 1];
    if (last && last.action === log.action && last.targetId === log.targetId) {
      last.count += 1;
    } else {
      out.push({ ...log, count: 1 });
    }
  }
  return out;
}
