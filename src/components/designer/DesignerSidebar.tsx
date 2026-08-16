"use client";

import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function DesignerSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Designer");
  const isSubmissions = pathname?.includes("/designer/submissions");

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface ring-1 ring-black/5">
      <div className="flex items-center gap-3 border-b border-black/5 px-6 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-white shadow-[0_4px_10px_0_rgba(0,207,124,0.2)]">
          <span className="material-symbols-outlined text-[20px]">palette</span>
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[14px] font-bold tracking-tight text-ink">
          {t("portal")}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">{t("navigation")}</p>
        <Link
          href="/designer"
          className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors ${!isSubmissions ? "bg-accent/10 font-bold text-accent" : "font-semibold text-ink-soft hover:bg-black/[0.03] hover:text-ink"}`}
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          {t("overview")}
        </Link>
        <Link
          href="/designer/submissions"
          className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors ${isSubmissions ? "bg-accent/10 font-bold text-accent" : "font-semibold text-ink-soft hover:bg-black/[0.03] hover:text-ink"}`}
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          {t("submissions")}
        </Link>
      </nav>

      <div className="flex items-center gap-2 border-t border-black/5 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[12px] font-bold text-ink">
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft">{email}</span>
        </div>
        <form action={signOutAction}>
          <button type="submit" title={t("logout")} aria-label={t("logout")} className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
