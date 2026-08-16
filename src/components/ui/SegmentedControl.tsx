import type { ReactNode } from "react";

/**
 * Shared segmented pill rail used for filter/range/type switching. Consolidates
 * the several near-identical pill-rail implementations (dashboard filter,
 * analytics range, content library types). The active segment is a raised white
 * pill with an accent-tinted count, matching DESIGN.md.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
  ariaLabel,
}: {
  options: { value: T; label: ReactNode; count?: number; dot?: "live" | "draft" | "warning" | "info" }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  const height = size === "sm" ? "h-8" : "h-9";
  const paddingY = size === "sm" ? "py-1" : "py-1.5";
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-ink/[0.04] p-1 ring-1 ring-black/5 ${height} ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const dotColor =
          opt.dot === "live"
            ? "bg-accent"
            : opt.dot === "warning"
              ? "bg-warning"
              : opt.dot === "info"
                ? "bg-info"
                : "bg-ink-faint";
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
              active
                ? "bg-surface text-ink shadow-sm ring-1 ring-black/5"
                : "text-ink-soft hover:text-ink"
            } ${paddingY}`}
          >
            {opt.dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />}
            <span className={active ? "font-semibold" : ""}>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`font-mono text-[11px] font-semibold tabular-nums ${
                  active ? "text-accent-deep" : "text-ink-faint"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
