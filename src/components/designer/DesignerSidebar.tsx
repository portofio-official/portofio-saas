"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function DesignerSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Designer");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSubmissions = pathname?.includes("/designer/submissions") ?? false;
  const initials = email.charAt(0).toUpperCase();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("portofio_designer_sidebar_collapsed");
      if (saved !== null) setCollapsed(saved === "true");
    } catch {
      // Ignore storage errors.
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem("portofio_designer_sidebar_collapsed", String(next));
      } catch {
        // Ignore storage errors.
      }
      return next;
    });
  }, []);

  const brand = (showLabel = !collapsed) => (
    <div className={`flex min-w-0 items-center gap-3 ${collapsed ? "cursor-pointer" : ""}`} onClick={collapsed ? toggleCollapsed : undefined}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white ring-1 ring-black/5">
        <span className="material-symbols-outlined text-[20px]">palette</span>
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold leading-none tracking-tight text-ink">{t("portal")}</p>
          <p className="mt-1 truncate text-[11px] font-medium text-ink-soft">{t("eyebrow")}</p>
        </div>
      )}
    </div>
  );

  const navItem = (href: "/designer" | "/designer/submissions", icon: string, label: string, active: boolean, compact = collapsed) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={compact ? label : undefined}
      className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-200 active:scale-[0.98] ${active ? "bg-accent/[0.1] font-bold text-accent-deep" : "font-medium text-ink-soft hover:bg-ink/[0.04] hover:text-ink"} ${compact ? "justify-center px-0" : ""}`}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />}
      <span className={`material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-105 ${active ? "text-accent" : "text-ink-faint group-hover:text-ink"}`}>{icon}</span>
      <span className={`truncate ${compact ? "hidden" : ""}`}>{label}</span>
    </Link>
  );

  const nav = (compact = collapsed) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
      <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint ${compact ? "sr-only" : ""}`}>{t("navigation")}</p>
      {navItem("/designer", "dashboard", t("overview"), !isSubmissions, compact)}
      {navItem("/designer/submissions", "upload_file", t("submissions"), isSubmissions, compact)}
    </nav>
  );

  const profile = (compact = collapsed) => (
    <div className="border-t border-black/5 bg-surface p-2.5">
      <div className={`flex items-center rounded-xl p-1.5 transition-colors ${compact ? "flex-col justify-center gap-2" : "justify-between gap-2 hover:bg-ink/[0.04]"}`}>
        <Link href="/dashboard/profile" title={compact ? email : undefined} className={`flex min-w-0 items-center gap-2.5 ${compact ? "justify-center" : ""}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-[13px] font-bold text-accent-deep ring-1 ring-accent/20">{initials}</span>
          <span className={`min-w-0 truncate text-[12px] font-semibold text-ink ${compact ? "hidden" : ""}`}>{email}</span>
        </Link>
        <form action={signOutAction} className={compact ? "flex w-full justify-center" : ""}>
          <button type="submit" title={t("logout")} aria-label={t("logout")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-95">
            <span className="material-symbols-outlined text-[17px]">logout</span>
          </button>
        </form>
      </div>
    </div>
  );

  const closeButton = (
    <button type="button" onClick={() => setMobileOpen(false)} aria-label={t("closeMenu")} className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink active:scale-95">
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  );

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-surface px-3.5 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] md:hidden">
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label={t("openMenu")} className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/[0.05] text-ink ring-1 ring-black/5 transition-all hover:bg-ink/[0.08] active:scale-95">
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          {brand(true)}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 font-display text-[12px] font-bold text-accent-deep ring-1 ring-accent/20">{initials}</span>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden" aria-hidden />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col overflow-hidden bg-surface shadow-floating ring-1 ring-black/5 md:hidden" role="dialog" aria-modal="true" aria-label={t("openMenu")}>
              <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-4">{brand(true)}{closeButton}</div>
              {nav(false)}
              {profile(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }} className={`relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-black/5 bg-surface transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex ${collapsed ? "w-[72px]" : "w-[248px]"}`}>
        <div className={`flex border-b border-black/5 transition-all duration-300 ${collapsed ? "justify-center px-2 py-3.5" : "items-center justify-between px-4 py-3.5"}`}>
          {brand(!collapsed)}
          {!collapsed && <button type="button" onClick={toggleCollapsed} title={t("collapseSidebar")} aria-label={t("collapseSidebar")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-all duration-200 hover:bg-ink/[0.06] hover:text-ink active:scale-95"><span className="material-symbols-outlined text-[18px]">left_panel_close</span></button>}
        </div>
        {nav()}
        {profile()}
      </motion.aside>
    </>
  );
}
