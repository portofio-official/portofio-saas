"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCard, AdminBadge, AdminEmptyState, CompositionBar, Sparkline, ActivityRow } from "./primitives";
import type { ActivityTone } from "./activity";
import type { AdminAttentionSummary } from "@/lib/admin";
import { CalendarBlank, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

type ActivityItem = {
  id: string;
  action: string;
  tone: ActivityTone;
  actorLabel: string;
  text: string;
  target: string | null;
  count: number;
  timeLabel: string;
  timeTitle: string;
};

function DeltaTag({ value }: { value: number | null }) {
  const t = useTranslations("Admin");
  if (value === null) return <span className="text-[12px] text-admin-ink-faint">{t("overview.newNoBaseline")}</span>;
  const positive = value >= 0;
  return (
    <span className={`text-[12px] font-semibold ${positive ? "text-admin-primary-text" : "text-admin-rose"}`}>
      {positive ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

export function AdminOverviewClientView({
  total,
  composition,
  pulse,
  new7,
  delta7,
  new30,
  delta30,
  attention,
  activity,
  range,
}: {
  total: number;
  composition: { label: string; value: number; className: string }[];
  pulse: number[];
  new7: number;
  delta7: number | null;
  new30: number;
  delta30: number | null;
  attention: AdminAttentionSummary;
  activity: ActivityItem[];
  range: string;
}) {
  const t = useTranslations("Admin");
  const [filter, setFilter] = useState<"all" | "user" | "template" | "blocklist">("all");

  const filtered = useMemo(
    () => (filter === "all" ? activity : activity.filter((a) => a.action.startsWith(filter))),
    [activity, filter],
  );

  const attentionItems = [
    attention.suspendedUsers > 0
      ? { key: "suspended", tone: "rose" as const, text: t("attention.suspended", { count: attention.suspendedUsers }) }
      : null,
    attention.pendingDomains > 0
      ? { key: "domains", tone: "amber" as const, text: t("attention.pendingDomains", { count: attention.pendingDomains }) }
      : null,
    attention.hiddenTemplates > 0
      ? { key: "hidden", tone: "neutral" as const, text: t("attention.hiddenTemplates", { count: attention.hiddenTemplates }) }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero + two fixed comparison cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard className="flex max-h-[260px] flex-col justify-between p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p aria-live="polite" className="font-display text-[44px] font-bold leading-none tracking-tight tabular-nums text-admin-ink">
                {total}
              </p>
              <p className="mt-2 text-[13px] font-medium text-admin-ink-soft">{t("overview.statTotal")}</p>
            </div>
            <Sparkline values={pulse} className="h-6 w-24 shrink-0" />
          </div>
          <div className="mt-5">
            <CompositionBar segments={composition} />
          </div>
        </AdminCard>

        <div className="flex flex-col gap-4">
          <AdminCard className="flex flex-1 flex-col justify-between p-5">
            <p className="font-mono text-[28px] font-bold leading-none tabular-nums text-admin-ink">+{new7}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[12px] text-admin-ink-faint">{t("overview.card7d")}</p>
              <DeltaTag value={delta7} />
            </div>
          </AdminCard>
          <AdminCard className="flex flex-1 flex-col justify-between p-5">
            <p className="font-mono text-[28px] font-bold leading-none tabular-nums text-admin-ink">+{new30}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[12px] text-admin-ink-faint">{t("overview.card30d")}</p>
              <DeltaTag value={delta30} />
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Activity + Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[15px] font-bold text-admin-ink">{t("activity.title")}</p>
            <div role="group" aria-label={t("activity.filterLabel")} className="flex items-center gap-1">
              {(["all", "user", "template", "blocklist"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`rounded-admin-sm px-2.5 py-1 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-admin-primary ${
                    filter === f ? "bg-admin-ink text-white" : "text-admin-ink-soft hover:bg-admin-ink/5"
                  }`}
                >
                  {t(`activity.filter_${f}`)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <AdminEmptyState
              icon={ClockCounterClockwise}
              title={t("activity.emptyTitle")}
              hint={t("activity.emptyHint", { range: t(`timeRange.${range}`) })}
            />
          ) : (
            <ul aria-live="polite" className="mt-3 divide-y divide-admin-border">
              {filtered.map((item) => (
                <ActivityRow
                  key={item.id}
                  tone={item.tone}
                  text={item.text}
                  target={item.target ?? undefined}
                  actorLabel={item.actorLabel}
                  timeLabel={item.timeLabel}
                  timeTitle={item.timeTitle}
                  countBadge={item.count}
                />
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="p-5">
          <p className="font-display text-[15px] font-bold text-admin-ink">{t("attention.title")}</p>
          {attentionItems.length === 0 ? (
            <AdminEmptyState icon={CalendarBlank} title={t("attention.allClear")} />
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {attentionItems.map((item) => (
                <li key={item.key}>
                  <AdminBadge tone={item.tone}>{item.text}</AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
