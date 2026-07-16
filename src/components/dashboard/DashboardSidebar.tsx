"use client";


import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { usePathname } from "next/navigation";

export function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("Workspace");
  const container = useRef<HTMLElement>(null);

  const isEditor = pathname?.endsWith("/editor");

  useGSAP(
    () => {
      if (isEditor || !container.current) return;
      gsap.fromTo(
        container.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "var(--ease-fluid)" }
      );
    },
    { scope: container, dependencies: [isEditor] }
  );

  if (isEditor) return null;

  const initials = email.charAt(0).toUpperCase();

  return (
    <aside ref={container} className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface ring-1 ring-black/5">
      {/* Workspace */}
      <div className="flex items-center gap-3 border-b border-black/5 px-6 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-ink text-[13px] font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          {initials}
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[14px] font-bold tracking-tight text-ink">
          My Workspace
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
          Navigation
        </p>
        <Link
          href="/dashboard"
          className="group flex items-center gap-3 rounded-[12px] bg-black/[0.03] px-3 py-2.5 text-[13px] font-semibold text-ink transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.06] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px] text-ink transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">grid_view</span>
          Projects
        </Link>
      </nav>

      {/* User footer */}
      <div className="border-t border-black/5 p-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="group flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-[13px] font-semibold text-ink-soft transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-danger/10 hover:text-danger active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t("logout")}
            </div>
            <span className="material-symbols-outlined text-[16px] opacity-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:opacity-100">
              arrow_forward
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
