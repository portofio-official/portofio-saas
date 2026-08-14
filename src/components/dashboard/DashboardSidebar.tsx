"use client";

import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ContentType } from "@/lib/content/types";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  badge?: string;
  disabled?: boolean;
  count?: number;
}

interface ContentChild extends NavItem {
  type: ContentType;
}

// The seven primary Content Library types surfaced in the sidebar.
// (caseStudy/gallery stay selectable in the manager but are not linked here.)
const CONTENT_GROUPS: { type: ContentType; icon: string }[] = [
  { type: "project", icon: "workspaces" },
  { type: "testimonial", icon: "rate_review" },
  { type: "certificate", icon: "workspace_premium" },
  { type: "experience", icon: "work_history" },
  { type: "education", icon: "school" },
  { type: "publication", icon: "menu_book" },
  { type: "media", icon: "photo_library" },
];

const KNOWN_BASES = [
  "/dashboard/templates",
  "/dashboard/content",
  "/dashboard/analytics",
  "/dashboard/profile",
  "/dashboard/billing",
];

export function DashboardSidebar({
  email,
  contentCounts = {},
}: {
  email: string;
  contentCounts?: Record<string, number>;
}) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const tc = useTranslations("ContentLibrary");
  const tw = useTranslations("Workspace");

  const isEditorPath = pathname?.endsWith("/editor") ?? false;

  // Normalize "/id/dashboard/..." → "/dashboard/..."
  const path = pathname?.replace(/^\/(id|en)(?=\/|$)/, "") ?? "/dashboard";

  const isTemplates = path.startsWith("/dashboard/templates");
  const isAnalytics = path.startsWith("/dashboard/analytics");
  const isProfile = path.startsWith("/dashboard/profile");
  const isBilling = path.startsWith("/dashboard/billing");
  const isKnown = KNOWN_BASES.some((base) => path.startsWith(base));
  const isWebsites = !isKnown;

  const primaryItems: NavItem[] = [
    { href: "/dashboard", icon: "web", label: t("websites"), active: isWebsites },
    { href: "/dashboard/templates", icon: "dashboard_customize", label: t("templates"), active: isTemplates },
  ];

  const contentItems: ContentChild[] = CONTENT_GROUPS.map((c) => ({
    ...c,
    href: `/dashboard/content/${c.type}`,
    label: tc(`types.${c.type}`),
    active: path === `/dashboard/content/${c.type}`,
    count: contentCounts[c.type] ?? 0,
  }));
  const contentParentActive = contentItems.some((c) => c.active);

  const analyticsItem: NavItem = {
    href: "/dashboard/analytics",
    icon: "analytics",
    label: t("analytics"),
    active: isAnalytics,
    badge: t("pro"),
  };

  const settingsItems: NavItem[] = [
    { href: "/dashboard/profile", icon: "person", label: t("profile"), active: isProfile },
    { href: "#", icon: "domain", label: t("domains"), active: false, disabled: true },
    { href: "/dashboard/billing", icon: "credit_card", label: t("billing"), active: isBilling },
  ];
  const settingsParentActive = settingsItems.some((c) => c.active);

  // Desktop: sidebar can collapse to an icon rail. Default = expanded (false).
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: sidebar opens as a slide-in drawer.
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sub-menus auto-open when active route matches.
  const [contentOpen, setContentOpen] = useState(contentParentActive);
  const [settingsOpen, setSettingsOpen] = useState(settingsParentActive);

  // Hydrate collapsed preference from localStorage on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portofio_sidebar_collapsed");
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
        localStorage.setItem("portofio_sidebar_collapsed", String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // Keep sub-menus in sync with active route.
  useEffect(() => {
    if (contentParentActive) setContentOpen(true);
    if (settingsParentActive) setSettingsOpen(true);
  }, [contentParentActive, settingsParentActive]);

  // Close mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (isEditorPath) return null;

  const initials = email.charAt(0).toUpperCase();

  const renderItem = (item: NavItem, indented = false, compact = collapsed) => {
    const content = (
      <>
        {item.active && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
        )}
        <span
          className={`material-symbols-outlined text-[19px] transition-colors ${
            item.active ? "text-accent drop-shadow-[0_2px_6px_rgba(0,207,124,0.35)]" : "text-ink-faint group-hover:text-ink"
          }`}
        >
          {item.icon}
        </span>
        <span className={`flex-1 truncate ${indented ? "pl-4" : ""} ${compact ? "hidden" : ""}`}>
          {item.label}
        </span>
        {!compact && item.count !== undefined && (
          <span className="font-mono text-[10.5px] font-semibold tabular-nums text-ink-faint">{item.count}</span>
        )}
        {!compact && item.badge && (
          <span className="rounded-full bg-accent/[0.12] px-2 py-0.5 text-[9px] font-bold tracking-wider text-accent-deep uppercase">
            {item.badge}
          </span>
        )}
      </>
    );

    if (item.disabled) {
      return (
        <div
          key={item.label}
          title={compact ? `${item.label} (${t("comingSoon")})` : "Coming soon"}
          className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] font-medium text-ink-faint cursor-not-allowed ${
            compact ? "justify-center px-0" : ""
          }`}
        >
          <div className={`flex items-center gap-2.5 ${indented && !compact ? "pl-6" : ""}`}>
            <span className="material-symbols-outlined text-[19px] text-ink-faint/70">{item.icon}</span>
            <span className={compact ? "hidden" : ""}>{item.label}</span>
          </div>
          {!compact && (
            <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[9px] font-semibold tracking-wider text-ink-faint uppercase">
              {t("comingSoon")}
            </span>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        title={compact ? item.label : undefined}
        className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-150 ${
          item.active
            ? "bg-accent/[0.09] text-accent-deep font-bold"
            : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink"
        } ${compact ? "justify-center px-0" : ""}`}
      >
        {content}
      </Link>
    );
  };

  const renderGroup = (
    key: string,
    label: string,
    icon: string,
    open: boolean,
    onToggle: () => void,
    children: ReactNode,
    parentActive: boolean,
    compact = collapsed,
  ) => {
    const handleGroupClick = () => {
      if (compact) {
        setCollapsed(false);
        if (!open) onToggle();
      } else {
        onToggle();
      }
    };

    return (
      <div key={key}>
        <button
          type="button"
          onClick={handleGroupClick}
          aria-expanded={open}
          title={compact ? label : undefined}
          className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-150 ${
            parentActive && (!open || compact)
              ? "bg-accent/[0.09] text-accent-deep font-bold"
              : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink"
          } ${compact ? "justify-center px-0" : ""}`}
        >
          {parentActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
          )}
          <span
            className={`material-symbols-outlined text-[19px] transition-colors ${
              parentActive ? "text-accent drop-shadow-[0_2px_6px_rgba(0,207,124,0.35)]" : "text-ink-faint group-hover:text-ink"
            }`}
          >
            {icon}
          </span>
          <span className={`flex-1 truncate text-left ${compact ? "hidden" : ""}`}>{label}</span>
          <span
            className={`material-symbols-outlined text-[16px] text-ink-faint transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } ${compact ? "hidden" : ""}`}
          >
            expand_more
          </span>
        </button>
        {!compact && (
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 pt-0.5">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  const divider = <div className="mx-2.5 my-2 border-t border-black/5" />;

  const brand = (showLabel = !collapsed) => (
    <div
      onClick={collapsed ? toggleCollapsed : undefined}
      title={collapsed ? t("expandSidebar") : undefined}
      className={`flex items-center gap-2.5 min-w-0 ${
        collapsed ? "cursor-pointer group" : ""
      }`}
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_20px_rgba(0,207,124,0.35)] ${
          collapsed ? "transition-transform group-hover:scale-105 active:scale-95" : ""
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">workspaces</span>
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold leading-none tracking-tight text-ink">Portofio</p>
          <p className="mt-1 truncate text-[11px] font-medium text-ink-faint">{tw("brandTagline")}</p>
        </div>
      )}
    </div>
  );

  const nav = (compact = collapsed) => (
    <nav className="flex flex-1 flex-col overflow-y-auto px-2.5 py-3">
      {primaryItems.map((item) => renderItem(item, false, compact))}
      {divider}

      {renderGroup(
        "content",
        t("contentLibrary"),
        "folder_open",
        contentOpen,
        () => setContentOpen((v) => !v),
        contentItems.map((item) => renderItem(item, true, compact)),
        contentParentActive,
        compact,
      )}

      {renderItem(analyticsItem, false, compact)}
      {divider}

      {renderGroup(
        "settings",
        t("settings"),
        "settings",
        settingsOpen,
        () => setSettingsOpen((v) => !v),
        settingsItems.map((item) => renderItem(item, true, compact)),
        settingsParentActive,
        compact,
      )}
    </nav>
  );

  const profile = (compact = collapsed) => (
    <div className="border-t border-black/5 p-2.5">
      <div
        className={`flex items-center rounded-xl p-1.5 transition-colors ${
          compact ? "flex-col gap-2 justify-center" : "justify-between gap-2 hover:bg-ink/[0.04]"
        }`}
      >
        <Link
          href="/dashboard/profile"
          title={compact ? `${t("profile")} (${email})` : undefined}
          className={`flex min-w-0 items-center gap-2.5 ${compact ? "justify-center" : ""}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-[12px] font-bold text-accent-deep ring-1 ring-accent/20">
            {initials}
          </span>
          <span className={`min-w-0 truncate text-[12px] font-medium text-ink-soft ${compact ? "hidden" : ""}`}>
            {email}
          </span>
        </Link>
        <form action={signOutAction} className={compact ? "w-full flex justify-center" : ""}>
          <button
            type="submit"
            title={tw("logout")}
            aria-label={tw("logout")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-danger"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </form>
      </div>
    </div>
  );

  const collapseToggleButton = (
    <button
      type="button"
      onClick={toggleCollapsed}
      title={t("collapseSidebar")}
      aria-label={t("collapseSidebar")}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-ink/[0.06] hover:text-ink"
    >
      <span className="material-symbols-outlined text-[18px]">left_panel_close</span>
    </button>
  );

  const closeButton = (
    <button
      type="button"
      onClick={closeMobile}
      aria-label={t("closeMenu")}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink"
    >
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  );

  return (
    <>
      {/* Mobile: floating trigger (only < md) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label={t("openMenu")}
        className="fixed top-3 left-3 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink shadow-[var(--shadow-diffused)] ring-1 ring-black/5 transition-transform active:scale-95 md:hidden"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* Mobile: drawer + backdrop */}
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
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col overflow-hidden bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5 select-none md:hidden"
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

      {/* Desktop: inline sidebar (md+) */}
      <motion.aside
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`relative hidden h-full shrink-0 flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5 select-none transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex ${
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