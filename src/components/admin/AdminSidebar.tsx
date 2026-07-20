"use client";

import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { usePathname } from "next/navigation";

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Workspace");
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;
      gsap.fromTo(
        container.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "var(--ease-fluid)" }
      );
    },
    { scope: container }
  );

  const initials = email.charAt(0).toUpperCase();

  const isBlocklist = pathname?.includes("/admin/blocklist");
  const isTemplates = pathname?.includes("/admin/templates");
  const navItems = [
    { href: "/admin", icon: "group", label: "Users", active: !isBlocklist && !isTemplates },
    { href: "/admin/templates", icon: "dashboard_customize", label: "Templates", active: !!isTemplates },
    { href: "/admin/blocklist", icon: "block", label: "Blocklist", active: !!isBlocklist },
  ];

  return (
    <aside ref={container} className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface ring-1 ring-black/5">
      {/* Workspace identity */}
      <div className="flex items-center gap-3 border-b border-black/5 px-6 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-ink text-[13px] font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[14px] font-bold tracking-tight text-ink">
          Admin Portal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
          Navigation
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
              item.active ? "bg-black/[0.03] text-ink hover:bg-black/[0.06]" : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
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
    </aside>
  );
}
