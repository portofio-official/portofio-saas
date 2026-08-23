"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import {
  GridFour,
  Users,
  Palette,
  Prohibit,
  ClockCounterClockwise,
  ShieldCheck,
  SidebarSimple,
  X,
  List,
  User,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";

interface NavItem {
  href: string;
  icon: Icon;
  label: string;
  active: boolean;
}

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary";

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Admin");
  const reducedMotion = useReducedMotion();

  // Normalize "/id/admin/..." → "/admin/..."
  const path = pathname?.replace(/^\/(id|en)(?=\/|$)/, "") ?? "/admin";

  const isUsers = path.startsWith("/admin/users");
  const isTemplates = path.startsWith("/admin/templates");
  const isBlocklist = path.startsWith("/admin/blocklist");
  const isAudit = path.startsWith("/admin/audit-log");
  const isOverview = path === "/admin";

  const navItems: NavItem[] = [
    { href: "/admin", icon: GridFour, label: t("navOverview"), active: isOverview },
    { href: "/admin/users", icon: Users, label: t("navUsers"), active: isUsers },
    { href: "/admin/templates", icon: Palette, label: t("navTemplates"), active: isTemplates },
    { href: "/admin/blocklist", icon: Prohibit, label: t("navBlocklist"), active: isBlocklist },
    { href: "/admin/audit-log", icon: ClockCounterClockwise, label: t("navAuditLog"), active: isAudit },
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

  const renderItem = (item: NavItem, compact = collapsed) => {
    const ItemIcon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        title={compact ? item.label : undefined}
        className={`group relative flex items-center gap-2.5 rounded-admin-sm px-3 py-2 text-[13px] transition-colors ${FOCUS_RING} ${
          item.active
            ? "bg-admin-primary-tint font-bold text-admin-primary-text"
            : "font-medium text-admin-ink-soft hover:bg-admin-ink/[0.04] hover:text-admin-ink"
        } ${compact ? "justify-center px-0" : ""}`}
      >
        {item.active && (
          <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-admin-primary" />
        )}
        <ItemIcon weight={item.active ? "fill" : "regular"} size={17} className="shrink-0" />
        <span className={`flex-1 truncate ${compact ? "hidden" : ""}`}>{item.label}</span>
      </Link>
    );
  };

  const brand = (showLabel = !collapsed) => (
    <div
      onClick={collapsed ? toggleCollapsed : undefined}
      title={collapsed ? t("expandSidebar") : undefined}
      className={`flex items-center gap-3 min-w-0 ${collapsed ? "cursor-pointer" : ""}`}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-admin-md bg-admin-primary text-white">
        <ShieldCheck weight="fill" size={19} />
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold leading-none tracking-tight text-admin-ink">
            {t("portalLabel")}
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-admin-ink-faint">
            {t("portalTagline")}
          </p>
        </div>
      )}
    </div>
  );

  const nav = (compact = collapsed) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
      <p
        className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-admin-ink-faint ${
          compact ? "sr-only" : ""
        }`}
      >
        {t("navLabel")}
      </p>
      {navItems.map((item) => renderItem(item, compact))}
    </nav>
  );

  const profile = (compact = collapsed) => (
    <div className="border-t border-admin-border p-2.5">
      <div
        className={`flex items-center rounded-admin-sm p-1.5 transition-colors ${
          compact ? "flex-col gap-2 justify-center" : "justify-between gap-2 hover:bg-admin-ink/[0.04]"
        }`}
      >
        <button
          type="button"
          ref={profileTriggerRef}
          onClick={toggleProfileMenu}
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          title={`${t("profileLabel")} (${email})`}
          className={`flex min-w-0 items-center gap-2.5 rounded-admin-sm transition-colors ${FOCUS_RING} ${
            compact ? "justify-center" : "flex-1 hover:bg-admin-ink/[0.04]"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-admin-primary-tint font-display text-[13px] font-bold text-admin-primary-text">
            {initials}
          </span>
          <span
            title={email}
            className={`min-w-0 truncate text-left text-[12px] font-semibold text-admin-ink ${compact ? "hidden" : ""}`}
          >
            {email}
          </span>
        </button>
        <form action={signOutAction} className={compact ? "w-full flex justify-center" : ""}>
          <button
            type="submit"
            title={t("logout")}
            aria-label={t("logout")}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-admin-sm text-admin-ink-faint transition-colors hover:bg-admin-rose-tint hover:text-admin-rose ${FOCUS_RING}`}
          >
            <SignOut size={17} />
          </button>
        </form>

        {profileMenuOpen && (
          <>
            {/* Click-outside backdrop */}
            <div className="fixed inset-0 z-40" onClick={closeProfileMenu} aria-hidden />
            <div
              style={profileMenuStyle}
              className="fixed z-50 w-56 -translate-y-full rounded-admin-md border border-admin-border bg-admin-surface p-1"
              role="menu"
              aria-label={t("profileLabel")}
            >
              <Link
                href="/admin/profile"
                role="menuitem"
                onClick={closeProfileMenu}
                className={`flex w-full items-center gap-2.5 rounded-admin-sm px-3 py-2 text-left text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-ink/[0.04] ${FOCUS_RING}`}
              >
                <User size={17} className="text-admin-ink-faint" />
                {t("profileLabel")}
              </Link>
              <Link
                href="/admin"
                role="menuitem"
                onClick={closeProfileMenu}
                className={`flex w-full items-center gap-2.5 rounded-admin-sm px-3 py-2 text-left text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-ink/[0.04] ${FOCUS_RING}`}
              >
                <ShieldCheck size={17} className="text-admin-ink-faint" />
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
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-admin-sm text-admin-ink-faint transition-colors hover:bg-admin-ink/[0.06] hover:text-admin-ink ${FOCUS_RING}`}
    >
      <SidebarSimple size={18} />
    </button>
  );

  const closeButton = (
    <button
      type="button"
      onClick={closeMobile}
      aria-label={t("closeMenu")}
      className={`flex h-11 w-11 items-center justify-center rounded-admin-sm text-admin-ink-soft transition-colors hover:bg-admin-ink/[0.05] hover:text-admin-ink ${FOCUS_RING}`}
    >
      <X size={20} />
    </button>
  );

  return (
    <>
      {/* Mobile: Integrated Top Bar (< lg) */}
      <div className="flex lg:hidden items-center justify-between gap-3 px-3.5 py-2.5 border-b border-admin-border bg-admin-surface shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
            className={`flex h-11 w-11 items-center justify-center rounded-admin-sm border border-admin-border text-admin-ink hover:bg-admin-ink/[0.05] ${FOCUS_RING}`}
          >
            <List size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-admin-sm bg-admin-primary text-white">
              <ShieldCheck weight="fill" size={16} />
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight text-admin-ink">
              {t("portalLabel")}
            </span>
          </div>
        </div>

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-primary-tint font-display text-[12px] font-bold text-admin-primary-text">
          {initials}
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
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-admin-ink/30 lg:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: reducedMotion ? 0 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: reducedMotion ? 0 : -280 }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-admin-border bg-admin-surface lg:hidden"
              data-admin-drawer="mobile"
              role="dialog"
              aria-modal="true"
              aria-label={t("openMenu")}
            >
              <div className="flex items-center justify-between gap-2 border-b border-admin-border px-4 py-4">
                <div className="flex items-center gap-2.5">{brand(true)}</div>
                {closeButton}
              </div>
              {nav(false)}
              {profile(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Inline Sidebar (lg+) */}
      <aside
        className={`relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-admin-border bg-admin-surface transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        <div
          className={`flex border-b border-admin-border transition-all duration-200 ${
            collapsed ? "justify-center px-2 py-3.5" : "items-center justify-between px-4 py-3.5"
          }`}
        >
          {brand(!collapsed)}
          {!collapsed && collapseToggleButton}
        </div>
        {nav()}
        {profile()}
      </aside>
    </>
  );
}
