"use client";


import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

export function DashboardSidebar({ email }: { email: string }) {

  const t = useTranslations("Workspace");
  const container = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");

  useGSAP(
    () => {
      gsap.fromTo(
        container.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "var(--ease-fluid)" }
      );
    },
    { scope: container }
  );

  const initials = email.charAt(0).toUpperCase();

  return (
    <aside ref={container} className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
      {/* Workspace switcher */}
      <div className="flex items-center gap-3 border-b border-black/5 px-6 py-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-[var(--shadow-inner-bezel)]">
          {initials}
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[15px] font-bold text-ink">
          My Workspace
        </span>
        <span className="material-symbols-outlined shrink-0 text-[18px] text-ink-faint transition-transform duration-300 group-hover:rotate-180">
          unfold_more
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2.5 rounded-2xl bg-canvas px-4 py-3 ring-1 ring-black/5 transition-all focus-within:ring-2 focus-within:ring-accent/50">
          <span className="material-symbols-outlined text-[16px] text-ink-faint">search</span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-faint">
          Navigation
        </p>
        <Link
          href="/dashboard"
          className="group flex items-center gap-3 rounded-[1.25rem] bg-black/[0.04] px-4 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-[var(--ease-fluid)] hover:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:scale-110">grid_view</span>
          Projects
        </Link>
      </nav>

      {/* User footer */}
      <div className="border-t border-black/5 p-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="group flex w-full items-center justify-between rounded-[1.25rem] px-4 py-3 text-sm font-semibold text-ink-soft transition-all duration-300 ease-[var(--ease-fluid)] hover:bg-danger/[0.08] hover:text-danger active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t("logout")}
            </div>
            <span className="material-symbols-outlined text-[16px] opacity-0 transition-all duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-1 group-hover:opacity-100">
              arrow_forward
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
