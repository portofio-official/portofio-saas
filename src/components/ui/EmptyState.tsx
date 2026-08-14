import type { ReactNode } from "react";

/**
 * Shared empty state: a tinted icon tile, a title, an optional description, and
 * an optional CTA. Used consistently across dashboard surfaces (workspace grid,
 * content library, analytics) in place of ad-hoc empty blocks.
 */
export function EmptyState({
  icon = "search_off",
  title,
  description,
  action,
  className = "",
}: {
  icon?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[320px] items-center justify-center ${className}`}>
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/[0.1] text-accent-deep ring-1 ring-accent/20">
          <span className="material-symbols-outlined text-[30px]">{icon}</span>
        </div>
        <div>
          <p className="text-[16px] font-bold text-ink">{title}</p>
          {description && <p className="mt-1 text-[13px] font-medium text-ink-soft">{description}</p>}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
