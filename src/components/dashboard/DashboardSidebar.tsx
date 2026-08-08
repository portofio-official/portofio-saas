"use client";

import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

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
  const isWebsites = !isTemplates && !isBilling && !isContent && !isProfile;

  const primaryGroup = [
    { href: "/dashboard", icon: "web", label: "Websites", active: isWebsites, comingSoon: false },
    { href: "/dashboard/templates", icon: "dashboard_customize", label: "Templates", active: isTemplates, comingSoon: false },
  ];

  const secondaryGroup = [
    { href: "#", icon: "analytics", label: "Analytics", active: false, badge: "Pro", comingSoon: true },
    { href: "#", icon: "language", label: "Domains", active: false, comingSoon: true },
    { href: "/dashboard/content", icon: "folder_open", label: "Content Library", active: isContent },
    { href: "/dashboard/billing", icon: "credit_card", label: "Billing", active: isBilling },
  ];

  const settingsGroup = [
    { href: "/dashboard/profile", icon: "person", label: "Profile", active: isProfile, comingSoon: false },
  ];

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-sm select-none"
    >
      {/* Workspace Switcher */}
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00cf7c] text-[12px] font-bold text-white shadow-[0_4px_10px_rgba(0,207,124,0.3)]">
            P
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-[13px] font-semibold text-[#111827] leading-tight">
              Portofio Workspace
            </span>
            <span className="truncate text-[11px] font-normal text-[#6B7280]">
              Personal Plan
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">unfold_more</span>
      </div>

      {/* Workflow Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2.5 py-3 gap-0.5">
        {/* Primary Group: Core Workflow */}
        <div className="flex flex-col gap-0.5">
          {primaryGroup.map((item) =>
            item.comingSoon ? (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] font-medium text-[#9CA3AF] cursor-not-allowed"
                title="Coming soon"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#6B7280] uppercase">Soon</span>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-150 ${
                  item.active
                    ? "bg-[#00cf7c]/10 text-[#00b368] font-bold"
                    : "text-[#4B5563] font-medium hover:bg-[#F9FAFB] hover:text-[#111827]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-colors ${
                    item.active ? "text-[#00cf7c]" : "text-[#6B7280] group-hover:text-[#111827]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            )
          )}
        </div>

        {/* Separator */}
        <div className="my-2 border-t border-[#F3F4F6] mx-1" />

        {/* Secondary Group: Site & Business Operations */}
        <div className="flex flex-col gap-0.5">
          {secondaryGroup.map((item) =>
            item.comingSoon ? (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] font-medium text-[#9CA3AF] cursor-not-allowed"
                title="Coming soon"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="rounded-md bg-[#e6faf2] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#00b368] uppercase">
                    {item.badge}
                  </span>
                ) : (
                  <span className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#6B7280] uppercase">Soon</span>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-150 ${
                  item.active
                    ? "bg-[#00cf7c]/10 text-[#00b368] font-bold"
                    : "text-[#4B5563] font-medium hover:bg-[#F9FAFB] hover:text-[#111827]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-colors ${
                    item.active ? "text-[#00cf7c]" : "text-[#6B7280] group-hover:text-[#111827]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md bg-[#e6faf2] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#00b368] uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          )}
        </div>

        {/* Separator */}
        <div className="my-2 border-t border-[#F3F4F6] mx-1" />

        {/* Settings Group */}
        <div className="flex flex-col gap-0.5">
          {settingsGroup.map((item) =>
            item.comingSoon ? (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] font-medium text-[#9CA3AF] cursor-not-allowed"
                title="Coming soon"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#6B7280] uppercase">Soon</span>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-all duration-150 ${
                  item.active
                    ? "bg-[#00cf7c]/10 text-[#00b368] font-bold"
                    : "text-[#4B5563] font-medium hover:bg-[#F9FAFB] hover:text-[#111827]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-colors ${
                    item.active ? "text-[#00cf7c]" : "text-[#6B7280] group-hover:text-[#111827]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            )
          )}
        </div>
      </nav>

      {/* Fixed User Profile at Bottom */}
      <div className="border-t border-[#F3F4F6] p-2.5">
        <div className="flex items-center justify-between gap-2 rounded-xl p-1.5 hover:bg-[#F9FAFB] transition-colors">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00cf7c]/15 text-[12px] font-bold text-[#00b368]">
              {initials}
            </span>
            <span className="min-w-0 truncate text-[12px] font-medium text-[#374151]">{email}</span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title={t("logout")}
              aria-label={t("logout")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#DC2626] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </form>
        </div>
      </div>

    </motion.aside>
  );
}

