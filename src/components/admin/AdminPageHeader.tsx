import type { ReactNode } from "react";

/**
 * Slim in-page header: H1 + subtitle + page-specific actions. Page context
 * (which section you're in) lives in AdminTopbar's breadcrumb now, so this
 * doesn't repeat it with an eyebrow/icon chip — see docs/DESIGN.md's
 * "Exception — /admin" note and the Session 113 redesign brief.
 */
export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-admin-border bg-admin-surface px-6 py-5 sm:px-8">
      <div className="min-w-0">
        <h1 className="font-display text-[20px] font-bold leading-tight tracking-tight text-admin-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-admin-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
