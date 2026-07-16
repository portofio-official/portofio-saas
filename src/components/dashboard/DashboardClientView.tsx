"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "@/i18n/navigation";
import type { Workspace } from "@/lib/workspace/types";

gsap.registerPlugin(useGSAP);

interface Dict {
  eyebrow: string;
  title: string;
  logout: string;
  listEyebrow: string;
  listTitle: string;
  createEyebrow: string;
  createTitleFirst: string;
  createTitle: string;
}

// Palette of preview background colors for workspace cards (cycling)
const CARD_PREVIEW_COLORS = [
  "bg-[#e6faf2]",
  "bg-[#f0f3f9]",
  "bg-[#fff7ed]",
  "bg-[#f0f9ff]",
  "bg-[#fdf4ff]",
  "bg-[#fafafa]",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function DashboardClientView({
  email,
  workspaces,
  dict,
}: {
  email: string;
  workspaces: Workspace[];
  dict: Dict;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "var(--ease-fluid)", delay: 0.1 }
      );
      gsap.fromTo(
        ".gsap-card",
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "var(--ease-fluid)", stagger: 0.08, delay: 0.2 }
      );
    },
    { scope: container }
  );

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Top bar */}
      <header className="gsap-header flex shrink-0 items-center justify-between px-10 py-10">
        <div>
          <p className="mb-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint w-max bg-black/[0.03]">
            Overview
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Projects</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Sort */}
          <button type="button" className="group flex items-center gap-2 rounded-full bg-shell px-5 py-3 text-sm font-semibold text-ink-soft transition-all duration-300 ease-[var(--ease-fluid)] hover:bg-black/5 hover:text-ink active:scale-[0.98]">
            Last viewed by me
            <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-y-[1px]">expand_more</span>
          </button>
          {/* New project */}
          <Link
            href="/templates"
            className="group flex items-center gap-2 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-semibold text-white transition-all duration-300 ease-[var(--ease-fluid)] hover:bg-black active:scale-[0.98] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.15)]"
          >
            New Project
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-1 group-hover:bg-white/30">
              <span className="material-symbols-outlined text-[16px]">add</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Cards grid */}
      <div ref={container} className="flex-1 overflow-y-auto px-10 pb-20">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((workspace, i) => (
              <Link
                key={workspace.id}
                href={`/dashboard/${workspace.id}/editor`}
                className="gsap-card group flex flex-col overflow-hidden rounded-[2rem] bg-shell p-2 shadow-[var(--shadow-diffused)] ring-1 ring-black/5 transition-all duration-500 ease-[var(--ease-fluid)] hover:-translate-y-1 hover:shadow-xl hover:ring-black/10"
              >
                {/* Card thumbnail (Inner Core) */}
                <div
                  className={`relative flex h-48 w-full items-center justify-center overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-inner-bezel)] ${CARD_PREVIEW_COLORS[i % CARD_PREVIEW_COLORS.length]}`}
                >
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                  {/* Placeholder browser chrome */}
                  <div className="w-[85%] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-500 ease-[var(--ease-fluid)] group-hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 border-b border-black/5 bg-canvas px-3 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                    </div>
                    <div className="flex flex-col gap-2 p-3">
                      <div className="h-2 w-3/4 rounded bg-ink/10" />
                      <div className="h-2 w-1/2 rounded bg-ink/6" />
                      <div className="mt-2 h-8 w-full rounded bg-ink/5" />
                    </div>
                  </div>
                </div>

                {/* Card meta */}
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold text-ink">{workspace.name}</p>
                    <p className="text-[12px] font-medium text-ink-faint">
                      Created {timeAgo(workspace.createdAt)}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-canvas px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-soft ring-1 ring-black/5">
                    Free
                  </span>
                </div>
              </Link>
            ))}

            {/* New project card */}
            <Link
              href="/templates"
              className="gsap-card group flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-[2rem] border-[1.5px] border-dashed border-black/10 bg-transparent text-ink-faint transition-all duration-500 ease-[var(--ease-fluid)] hover:border-ink/20 hover:bg-black/[0.02] hover:text-ink"
            >
              <span className="material-symbols-outlined text-[40px] transition-transform duration-500 ease-[var(--ease-fluid)] group-hover:scale-110 group-hover:text-ink">
                add_circle
              </span>
              <span className="font-display text-base font-bold">New Project</span>
            </Link>
          </div>
        ) : (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <span className="material-symbols-outlined text-[64px] text-ink-faint/50">
              layers
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold tracking-tight text-ink">No projects yet</p>
              <p className="mt-2 text-base text-ink-soft">Create your first portfolio project to get started.</p>
            </div>
            <Link
              href="/templates"
              className="group mt-4 flex items-center gap-2 rounded-full bg-ink py-3 pl-8 pr-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[var(--ease-fluid)] hover:bg-black active:scale-[0.98]"
            >
              Create project
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-1 group-hover:bg-white/30">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
