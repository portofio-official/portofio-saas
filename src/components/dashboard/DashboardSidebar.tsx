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
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    },
    { scope: container }
  );

  const initials = email.charAt(0).toUpperCase();

  return (
    <aside ref={container} className="flex h-full w-56 shrink-0 flex-col border-r border-black/5 bg-surface">
      {/* Workspace switcher */}
      <div className="flex items-center gap-2.5 border-b border-black/5 px-4 py-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          My Workspace
        </span>
        <span className="material-symbols-outlined shrink-0 text-[18px] text-ink-faint">
          unfold_more
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 ring-1 ring-black/5">
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
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
        <p className="mb-1 px-2 pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
          Navigation
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors bg-black/[0.05] text-ink"
        >
          <span className="material-symbols-outlined text-[17px]">grid_view</span>
          Projects
        </Link>
      </nav>

      {/* User footer */}
      <div className="border-t border-black/5 px-3 py-3">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-black/[0.03] hover:text-danger"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
            {t("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
