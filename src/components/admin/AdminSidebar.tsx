"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Admin");

  // Normalize "/id/admin/..." → "/admin/..."
  const path = pathname?.replace(/^\/(id|en)(?=\/|$)/, "") ?? "/admin";

  const isUsers = path.startsWith("/admin/users");
  const isTemplates = path.startsWith("/admin/templates");
  const isBlocklist = path.startsWith("/admin/blocklist");
  const isAudit = path.startsWith("/admin/audit-log");
  const isOverview = path === "/admin";

  const navItems: NavItem[] = [
    { href: "/admin", icon: "space_dashboard", label: t("navOverview"), active: isOverview },
    { href: "/admin/users", icon: "group", label: t("navUsers"), active: isUsers },
    { href: "/admin/templates", icon: "dashboard_customize", label: t("navTemplates"), active: isTemplates },
    { href: "/admin/blocklist", icon: "block", label: t("navBlocklist"), active: isBlocklist },
    { href: "/admin/audit-log", icon: "history", label: t("navAuditLog"), active: isAudit },
  ];

  // Desktop: sidebar can collapse to an icon rail. Default = expanded.
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: sidebar opens as a slide-in drawer.
  const [mobileOpen, setMobileOpen] = useState(false);
  // Avatar menu (Profile / Admin Dashboard).
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuStyle, setProfileMenuStyle] = useState<CSSProperties | undefined>(undefined);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  // Hydrate collapse preference from localStorage on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portofio_admin_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("portofio_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // Close mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  // Avatar menu: Escape closes; position is computed from the trigger's rect so
  // the panel can escape the sidebar's overflow-hidden without clipping.
  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen((prev) => {
      if (prev) return false;
      const el = profileTriggerRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      setProfileMenuStyle({ left: Math.max(8, rect.right - 224), top: rect.top - 8 });
      return true;
    });
  }, []);

  const closeProfileMenu = useCallback(() => setProfileMenuOpen(false), []);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [profileMenuOpen]);

  // Lock body scroll while mobile drawer is open + Escape to close + focus close button.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
      if (e.key === "Tab") {
        const drawer = document.querySelector<HTMLElement>('[data-admin-drawer="mobile"]');
        if (!drawer) return;
        const focusables = drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Move focus to the close button so keyboard users land inside the drawer.
    const timer = window.setTimeout(() => {
      document.querySelector<HTMLButtonElement>('[aria-label="' + t("closeMenu") + '"]')?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [mobileOpen, t]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const initials = email.charAt(0).toUpperCase();

  const renderItem = (item: NavItem, compact = collapsed) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      title={compact ? item.label : undefined}
      className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-200 active:scale-[0.98] ${
        item.active
          ? "bg-accent/[0.1] text-accent-deep font-bold"
          : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink"
      } ${compact ? "justify-center px-0" : ""}`}
    >
      {item.active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
      )}
      <span
        className={`material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-105 ${
          item.active ? "text-accent" : "text-ink-faint group-hover:text-ink"
        }`}
      >
        {item.icon}
      </span>
      <span className={`flex-1 truncate ${compact ? "hidden" : ""}`}>{item.label}</span>
    </Link>
  );

  const brand = (showLabel = !collapsed) => (
    <div
      onClick={collapsed ? toggleCollapsed : undefined}
      title={collapsed ? t("expandSidebar") : undefined}
      className={`flex items-center gap-3 min-w-0 ${
        collapsed ? "cursor-pointer group" : ""
      }`}
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white ring-1 ring-black/5 transition-transform duration-300 ${
          collapsed ? "group-hover:scale-105 active:scale-95" : ""
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">shield</span>
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold leading-none tracking-tight text-ink">
            {t("portalLabel")}
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-ink-faint">
            {t("portalTagline")}
          </p>
        </div>
      )}
    </div>
  );

  const nav = (compact = collapsed) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
      <p
        className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint ${
          compact ? "sr-only" : ""
        }`}
      >
        {t("navLabel")}
      </p>
      {navItems.map((item) => renderItem(item, compact))}
    </nav>
  );

  const profile = (compact = collapsed) => (
    <div className="border-t border-black/5 p-2.5 bg-surface">
      <div
        className={`flex items-center rounded-xl p-1.5 transition-colors ${
          compact ? "flex-col gap-2 justify-center" : "justify-between gap-2 hover:bg-ink/[0.04]"
        }`}
      >
        <button
          type="button"
          ref={profileTriggerRef}
          onClick={toggleProfileMenu}
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          title={compact ? `${t("profileLabel")} (${email})` : undefined}
          className={`flex min-w-0 items-center gap-2.5 rounded-lg transition-all active:scale-[0.98] ${
            compact ? "justify-center" : "flex-1 hover:bg-ink/[0.04]"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-[13px] font-bold text-accent-deep ring-1 ring-accent/20">
            {initials}
          </span>
          <span className={`min-w-0 truncate text-left text-[12px] font-semibold text-ink ${compact ? "hidden" : ""}`}>
            {email}
          </span>
        </button>
        <form action={signOutAction} className={compact ? "w-full flex justify-center" : ""}>
          <button
            type="submit"
            title={t("logout")}
            aria-label={t("logout")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
          </button>
        </form>

        {profileMenuOpen && (
          <>
            {/* Click-outside backdrop */}
            <div className="fixed inset-0 z-40" onClick={closeProfileMenu} aria-hidden />
            <div
              style={profileMenuStyle}
              className="fixed z-50 w-56 -translate-y-full rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5"
              role="menu"
              aria-label={t("profileLabel")}
            >
              <Link
                href="/admin/profile"
                role="menuitem"
                onClick={closeProfileMenu}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04]"
              >
                <span className="material-symbols-outlined text-[17px] text-ink-faint">person</span>
                {t("profileLabel")}
              </Link>
              <Link
                href="/admin"
                role="menuitem"
                onClick={closeProfileMenu}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.04]"
              >
                <span className="material-symbols-outlined text-[17px] text-ink-faint">shield</span>
                {t("adminDashboard")}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const collapseToggleButton = (
    <button
      type="button"
      onClick={toggleCollapsed}
      title={t("collapseSidebar")}
      aria-label={t("collapseSidebar")}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-all duration-200 hover:bg-ink/[0.06] hover:text-ink active:scale-95"
    >
      <span className="material-symbols-outlined text-[18px]">left_panel_close</span>
    </button>
  );

  const closeButton = (
    <button
      type="button"
      onClick={closeMobile}
      aria-label={t("closeMenu")}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink active:scale-95"
    >
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  );

  return (
    <>
      {/* Mobile: Integrated Top Bar (< md) */}
      <div className="flex md:hidden items-center justify-between gap-3 px-3.5 py-2.5 border-b border-black/5 bg-surface shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/[0.05] text-ink hover:bg-ink/[0.08] active:scale-95 transition-all ring-1 ring-black/5"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white font-bold text-[13px] ring-1 ring-black/5">
              <span className="material-symbols-outlined text-[16px]">shield</span>
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight text-ink">
              {t("portalLabel")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent-deep font-display text-[12px] font-bold ring-1 ring-accent/20">
            {initials}
          </span>
        </div>
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
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col overflow-hidden bg-surface shadow-floating ring-1 ring-black/5 md:hidden"
              data-admin-drawer="mobile"
              role="dialog"
              aria-modal="true"
              aria-label={t("openMenu")}
            >
              <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-4">
                <div className="flex items-center gap-2.5">{brand(true)}</div>
                {closeButton}
              </div>
              {nav(false)}
              {profile(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Inline Sidebar (md+) */}
      <motion.aside
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className={`relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-black/5 bg-surface transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex ${
          collapsed ? "w-[72px]" : "w-[248px]"
        }`}
      >
        <div
          className={`flex border-b border-black/5 transition-all duration-300 ${
            collapsed ? "justify-center px-2 py-3.5" : "items-center justify-between px-4 py-3.5"
          }`}
        >
          {brand(!collapsed)}
          {!collapsed && collapseToggleButton}
        </div>
        {nav()}
        {profile()}
      </motion.aside>
    </>
  );
}