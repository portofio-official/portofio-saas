"use client";

import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Admin");

  const initials = email.charAt(0).toUpperCase();

  const isBlocklist = pathname?.includes("/admin/blocklist");
  const isTemplates = pathname?.includes("/admin/templates");
  const navItems = [
    { href: "/admin", icon: "group", label: t("navUsers"), active: !isBlocklist && !isTemplates },
    { href: "/admin/templates", icon: "dashboard_customize", label: t("navTemplates"), active: !!isTemplates },
    { href: "/admin/blocklist", icon: "block", label: t("navBlocklist"), active: !!isBlocklist },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface ring-1 ring-black/5"
    >
      {/* Workspace identity */}
      <div className="flex items-center gap-3 border-b border-black/5 px-6 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-[13px] font-bold text-white shadow-[0_4px_10px_0_rgba(0,207,124,0.2)]">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[14px] font-bold tracking-tight text-ink">
          {t("portalLabel")}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
          {t("navLabel")}
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-all duration-300 active:scale-[0.98] ${
              item.active ? "bg-accent/10 text-accent font-bold" : "text-ink-soft font-semibold hover:bg-black/[0.03] hover:text-ink"
            }`}
          >
            <span className="material-symbols-outlined text-[18px] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User profile */}
      <div className="flex items-center gap-2 border-t border-black/5 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[12px] font-bold text-ink">
            {initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft">{email}</span>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            title={t("logout")}
            aria-label={t("logout")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-faint transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-danger/10 hover:text-danger active:scale-[0.95]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
