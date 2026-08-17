"use client";

import { useState, useCallback, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function DesignerSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Designer");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSubmissions = pathname?.includes("/designer/submissions");

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Close the mobile drawer on navigation. Mirrors DashboardSidebar:139 /
  // AdminSidebar:71 (same external-sync pattern). The react-hooks compiler lint
  // flags this form inconsistently, so it is disabled here with the same
  // justification the sibling shells rely on.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open + Escape to close + focus close button.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      document.querySelector<HTMLButtonElement>("[data-designer-drawer-close]")?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [mobileOpen]);

  const brand = (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-white shadow-[0_4px_10px_0_rgba(0,207,124,0.2)]">
        <span className="material-symbols-outlined text-[20px]">palette</span>
      </span>
      <span className="min-w-0 flex-1 truncate font-display text-[14px] font-bold tracking-tight text-ink">
        {t("portal")}
      </span>
    </div>
  );

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
      <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">{t("navigation")}</p>
      <Link
        href="/designer"
        className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors active:scale-[0.98] ${!isSubmissions ? "bg-accent/10 font-bold text-accent" : "font-semibold text-ink-soft hover:bg-black/[0.03] hover:text-ink"}`}
      >
        <span className="material-symbols-outlined text-[18px]">dashboard</span>
        {t("overview")}
      </Link>
      <Link
        href="/designer/submissions"
        className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors active:scale-[0.98] ${isSubmissions ? "bg-accent/10 font-bold text-accent" : "font-semibold text-ink-soft hover:bg-black/[0.03] hover:text-ink"}`}
      >
        <span className="material-symbols-outlined text-[18px]">upload_file</span>
        {t("submissions")}
      </Link>
    </nav>
  );

  const profile = (
    <div className="flex items-center gap-2 border-t border-black/5 p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 py-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[12px] font-bold text-ink">
          {email.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft">{email}</span>
      </div>
      <form action={signOutAction}>
        <button type="submit" title={t("logout")} aria-label={t("logout")} className="flex h-10 w-10 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger active:scale-95">
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile: Integrated Top Bar (< md) */}
      <div className="flex md:hidden shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-surface px-3.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] pb-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/[0.05] text-ink ring-1 ring-black/5 transition-all hover:bg-ink/[0.08] active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <span className="min-w-0 truncate font-display text-[15px] font-bold tracking-tight text-ink">
            {t("portal")}
          </span>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-[12px] font-bold text-accent-deep ring-1 ring-accent/20">
          {email.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Mobile: Drawer + Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col overflow-hidden rounded-r-[2rem] bg-surface shadow-floating ring-1 ring-black/5 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t("portal")}
            >
              <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4">
                {brand}
                <button
                  type="button"
                  onClick={closeMobile}
                  data-designer-drawer-close
                  aria-label={t("closeMenu")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              {nav}
              {profile}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Inline Sidebar (md+) */}
      <aside className="hidden h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface ring-1 ring-black/5 md:flex">
        <div className="border-b border-black/5 px-6 py-6">{brand}</div>
        {nav}
        {profile}
      </aside>
    </>
  );
}
