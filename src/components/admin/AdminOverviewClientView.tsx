"use client";

import { motion } from "framer-motion";
import type { Icon } from "@phosphor-icons/react";
import { Users, UserPlus, CalendarBlank, ShieldCheck, Palette, UserCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@/i18n/navigation";
import { getActivityVisual } from "./activityIcon";

const ICONS: Record<string, Icon> = {
  users: Users,
  userPlus: UserPlus,
  calendar: CalendarBlank,
  shield: ShieldCheck,
  palette: Palette,
  userCircle: UserCircle,
};

export interface OverviewMetric {
  key: keyof typeof ICONS;
  label: string;
  value: number;
}

export interface OverviewActivity {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  timeLabel: string;
}

const EASE = [0.32, 0.72, 0, 1] as const;

export function AdminOverviewClientView({
  total,
  companions,
  roles,
  recentLogs,
  emptyLabel,
  recentActivityLabel,
  viewAllLabel,
}: {
  total: OverviewMetric;
  companions: OverviewMetric[];
  roles: OverviewMetric[];
  recentLogs: OverviewActivity[];
  emptyLabel: string;
  recentActivityLabel: string;
  viewAllLabel: string;
}) {
  const TotalIcon = ICONS[total.key];

  return (
    <div className="flex flex-col gap-4">
      {/* Bento row: hero total + companion metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-accent-tint via-white to-white p-1.5 ring-1 ring-black/5 lg:col-span-2"
        >
          <div className="relative overflow-hidden rounded-[22px] bg-white/60 p-7 sm:p-8">
            <Sparkle
              weight="fill"
              className="pointer-events-none absolute -right-6 -top-6 text-accent/[0.08]"
              size={180}
            />
            <div className="relative flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/[0.12] text-accent-deep ring-1 ring-accent/20">
                <TotalIcon weight="duotone" size={24} />
              </div>
              <span className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <p className="relative mt-6 font-mono text-[52px] font-bold leading-none tracking-tight tabular-nums text-ink sm:text-[64px]">
              {total.value}
            </p>
            <p className="relative mt-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
              {total.label}
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          {companions.map((metric, i) => {
            const MetricIcon = ICONS[metric.key];
            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 + i * 0.06, ease: EASE }}
                whileHover={{ y: -2 }}
                className="flex flex-1 items-center gap-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-positive/10 text-positive">
                  <MetricIcon weight="duotone" size={20} />
                </div>
                <div>
                  <p className="font-mono text-[24px] font-bold leading-none tabular-nums text-ink">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-ink-faint">{metric.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Role breakdown row: dense secondary metrics */}
      <div className="grid grid-cols-3 gap-3.5">
        {roles.map((metric, i) => {
          const MetricIcon = ICONS[metric.key];
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.05, ease: EASE }}
              whileHover={{ y: -1 }}
              className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
                  <MetricIcon weight="duotone" size={16} />
                </div>
                <p className="font-mono text-[20px] font-bold leading-none tabular-nums text-ink">
                  {metric.value}
                </p>
              </div>
              <p className="mt-2 text-[11px] font-medium text-ink-faint">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[15px] font-bold text-ink">{recentActivityLabel}</p>
          <Link
            href="/admin/audit-log"
            className="text-[13px] font-semibold text-accent-deep transition-colors hover:text-accent"
          >
            {viewAllLabel}
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="mt-6 text-center text-[13px] font-medium text-ink-soft">{emptyLabel}</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {recentLogs.map((log) => {
              const { icon: ActivityIcon, tone, bg } = getActivityVisual(log.action);
              return (
                <li key={log.id} className="flex items-center gap-3 py-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${tone}`}>
                    <ActivityIcon weight="duotone" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{log.action}</p>
                    <p className="truncate text-[12px] text-ink-soft">
                      {log.targetType}
                      {log.targetId ? ` · ${log.targetId}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">{log.timeLabel}</span>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
