import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

/**
 * Admin-only page header — deliberately separate from the shared
 * `@/components/ui/PageHeader` (used by /dashboard, /profile, /content) so
 * admin's icon-chip treatment doesn't leak into user-facing surfaces that
 * still follow docs/DESIGN.md exactly. See docs/DESIGN.md's "Exception —
 * /admin" note.
 */
export function AdminPageHeader({
  icon: IconComp,
  tone = "bg-accent/10 text-accent-deep",
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  icon: Icon;
  tone?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-black/5 bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 px-6 pt-6 sm:px-8">
        <div className="flex min-w-0 max-w-xl items-start gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
            <IconComp weight="duotone" size={24} />
          </span>
          <div className="min-w-0">
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
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
      </div>
    </header>
  );
}
