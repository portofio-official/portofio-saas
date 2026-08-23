import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

/**
 * Admin "instrument panel" primitives — flat border instead of shadow, one
 * radius scale, admin-scoped color tokens only. See docs/DESIGN.md's
 * "Exception — /admin" note and the Session 113 redesign brief.
 */

export function AdminCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag className={`rounded-admin-md border border-admin-border bg-admin-surface ${className}`}>
      {children}
    </Tag>
  );
}

const BADGE_TONES = {
  positive: "bg-admin-primary-tint text-admin-primary-text",
  amber: "bg-admin-amber-tint text-admin-amber-text",
  rose: "bg-admin-rose-tint text-admin-rose",
  neutral: "bg-admin-ink/5 text-admin-ink-soft",
} as const;

const BADGE_DOT = {
  positive: "bg-admin-primary",
  amber: "bg-admin-amber",
  rose: "bg-admin-rose",
  neutral: "bg-admin-ink-faint",
} as const;

export function AdminBadge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-admin-sm px-2 py-0.5 text-[12px] font-semibold ${BADGE_TONES[tone]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${BADGE_DOT[tone]}`} />
      {children}
    </span>
  );
}

export function AdminEmptyState({
  icon: IconComp,
  title,
  hint,
  action,
}: {
  icon?: Icon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {IconComp && <IconComp size={22} className="text-admin-ink-faint" />}
      <p className="text-[14px] font-semibold text-admin-ink">{title}</p>
      {hint && <p className="max-w-xs text-[13px] text-admin-ink-soft">{hint}</p>}
      {action}
    </div>
  );
}

export function AdminErrorState({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-[14px] font-semibold text-admin-rose">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-admin-sm border border-admin-border px-3 py-1.5 text-[13px] font-semibold text-admin-ink transition-colors hover:bg-admin-ink/5"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function AdminSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-admin-sm bg-admin-ink/[0.06] ${className}`} />;
}

/** Minimal inline sparkline — the "pulse" secondary trend indicator. No axes, no legend. */
export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (values.length < 2) return <div className={className} />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--color-admin-primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Composition bar — segmented horizontal bar replacing 3 separate role cards. */
export function CompositionBar({
  segments,
}: {
  segments: { label: string; value: number; className: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-admin-ink/[0.06]">
        {segments.map((s) => (
          <div
            key={s.label}
            className={s.className}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[12px] tabular-nums text-admin-ink-soft">
        {segments.map((s) => `${s.value} ${s.label}`).join(" · ")}
      </p>
    </div>
  );
}

/** Dense activity row: dot · actor+action (human) · target (mono) ... time (relative, mono). */
export function ActivityRow({
  tone,
  text,
  target,
  actorLabel,
  timeLabel,
  timeTitle,
  countBadge,
}: {
  tone: "positive" | "amber" | "rose" | "neutral";
  text: string;
  target?: string;
  actorLabel: string;
  timeLabel: string;
  timeTitle: string;
  countBadge?: number;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={`h-2 w-2 shrink-0 rounded-full ${BADGE_DOT[tone]}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-admin-ink">
          <span className="font-semibold">{actorLabel}</span> {text}
          {target && <span className="ml-1 font-mono text-[12px] text-admin-ink-soft">{target}</span>}
          {countBadge && countBadge > 1 && (
            <span className="ml-1.5 rounded-admin-sm bg-admin-ink/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-admin-ink-soft">
              ×{countBadge}
            </span>
          )}
        </p>
      </div>
      <time
        dateTime={timeTitle}
        title={timeTitle}
        className="shrink-0 font-mono text-[11px] tabular-nums text-admin-ink-faint"
      >
        {timeLabel}
      </time>
    </li>
  );
}
