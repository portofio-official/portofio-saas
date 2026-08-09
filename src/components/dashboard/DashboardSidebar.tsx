"use client";

import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  badge?: string;
  comingSoon?: boolean;
}

export function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Workspace");

  const isEditor = pathname?.endsWith("/editor");
  if (isEditor) return null;

  const initials = email.charAt(0).toUpperCase();

  const isTemplates = pathname?.includes("/dashboard/templates");
  const isBilling = pathname?.includes("/dashboard/billing");
  const isContent = pathname?.includes("/dashboard/content");
  const isProfile = pathname?.includes("/dashboard/profile");
  const isAnalytics = pathname?.includes("/dashboard/analytics");
  const isWebsites = !isTemplates && !isBilling && !isContent && !isProfile && !isAnalytics;

  const primaryGroup: NavItem[] = [
    { href: "/dashboard", icon: "web", label: "Websites", active: isWebsites },
    { href: "/dashboard/templates", icon: "dashboard_customize", label: "Templates", active: isTemplates },
  ];

  const secondaryGroup: NavItem[] = [
    { href: "/dashboard/analytics", icon: "analytics", label: "Analytics", active: isAnalytics, badge: "Pro" },
    { href: "#", icon: "language", label: "Domains", active: false, comingSoon: true },
    { href: "/dashboard/content", icon: "folder_open", label: "Content Library", active: isContent },
    { href: "/dashboard/billing", icon: "credit_card", label: "Billing", active: isBilling },
  ];

  const settingsGroup: NavItem[] = [
    { href: "/dashboard/profile", icon: "person", label: "Profile", active: isProfile },
  ];

  const renderItem = (item: NavItem) => {
    if (item.comingSoon) {
      return (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] font-medium text-ink-faint cursor-not-allowed"
          title="Coming soon"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[19px] text-ink-faint/70">{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[9px] font-semibold tracking-wider text-ink-faint uppercase">
            {item.badge ?? "Soon"}
          </span>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-150 ${
          item.active
            ? "bg-accent/[0.09] text-accent-deep font-bold"
            : "text-ink-soft font-medium hover:bg-ink/[0.04] hover:text-ink"
        }`}
      >
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
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && <span className="rounded-full bg-accent/[0.12] px-2 py-0.5 text-[9px] font-bold tracking-wider text-accent-deep uppercase">{item.badge}</span>}
      </Link>
    );
  };

  const divider = <div className="mx-2.5 my-2 border-t border-black/5" />;

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5 select-none sm:w-[248px]"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-black/5 px-4 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_20px_rgba(0,207,124,0.35)]">
          <span className="material-symbols-outlined text-[20px]">workspaces</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold leading-none tracking-tight text-ink">
            Portofio
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-ink-faint">{t("brandTagline")}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2.5 py-3">
        {primaryGroup.map(renderItem)}
        {divider}
        {secondaryGroup.map(renderItem)}
        {divider}
        {settingsGroup.map(renderItem)}
      </nav>

      {/* Profile */}
      <div className="border-t border-black/5 p-2.5">
        <div className="flex items-center justify-between gap-2 rounded-xl p-1.5 transition-colors hover:bg-ink/[0.04]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-[12px] font-bold text-accent-deep ring-1 ring-accent/20">
              {initials}
            </span>
            <span className="min-w-0 truncate text-[12px] font-medium text-ink-soft">{email}</span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title={t("logout")}
              aria-label={t("logout")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-danger"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </form>
        </div>
      </div>
    </motion.aside>
  );
}