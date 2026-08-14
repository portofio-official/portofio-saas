import type { ReactNode } from "react";

/**
 * Shared page header for dashboard surfaces: an accent eyebrow pill, an Outfit
 * display title, a subtitle, and an optional trailing actions slot. Consolidates
 * the previously ad-hoc header treatments across Billing / Profile / Content
 * Library / Template Gallery onto the pattern used by Dashboard home + Analytics.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`shrink-0 border-b border-black/5 bg-surface ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 px-6 pt-6 sm:px-8">
        <div className="min-w-0 max-w-xl">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2.5 font-display text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm font-medium text-ink-soft">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
