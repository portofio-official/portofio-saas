"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AdminCommandPalette } from "./AdminCommandPalette";

const RANGES = ["7d", "30d", "90d"] as const;
export type AdminRange = (typeof RANGES)[number];

export function AdminTopbar() {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const path = pathname?.replace(/^\/(id|en)(?=\/|$)/, "") ?? "/admin";
  const crumb = path.startsWith("/admin/users")
    ? t("navUsers")
    : path.startsWith("/admin/templates")
      ? t("navTemplates")
      : path.startsWith("/admin/blocklist")
        ? t("navBlocklist")
        : path.startsWith("/admin/audit-log")
          ? t("navAuditLog")
          : t("navOverview");

  const range = (searchParams?.get("range") as AdminRange) ?? "30d";

  const setRange = (next: AdminRange) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("range", next);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-admin-border bg-admin-surface px-4 py-2.5 sm:px-8">
      <nav aria-label="Breadcrumb" className="min-w-0 truncate text-[13px] text-admin-ink-soft">
        <span>{t("eyebrow")}</span>
        <span className="mx-1.5 text-admin-ink-faint">/</span>
        <span className="font-semibold text-admin-ink">{crumb}</span>
      </nav>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <AdminCommandPalette />
        <div
          role="group"
          aria-label={t("timeRange.label")}
          className="flex items-center rounded-admin-sm border border-admin-border p-0.5"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-[calc(var(--radius-admin-sm)-2px)] px-2 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-admin-primary sm:px-2.5 ${
                range === r ? "bg-admin-ink text-admin-canvas" : "text-admin-ink-soft hover:bg-admin-ink/5"
              }`}
            >
              <span className="sm:hidden">{r}</span>
              <span className="hidden sm:inline">{t(`timeRange.${r}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
