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
        ".gsap-sidebar",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(
        ".gsap-header",
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".gsap-card",
        { y: 24, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.07,
          duration: 0.5,
          ease: "power3.out",
          delay: 0.2,
        }
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
      <header className="gsap-header flex h-14 shrink-0 items-center justify-between border-b border-black/5 bg-surface/80 px-6 backdrop-blur-sm">
        <h1 className="font-display text-base font-bold text-ink">Projects</h1>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <button className="flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-1.5 text-sm font-medium text-ink-soft ring-1 ring-black/5 transition-colors hover:text-ink">
            Last viewed by me
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          {/* New project */}
          <Link
            href="/dashboard/templates"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-accent-deep active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Project
          </Link>
        </div>
      </header>

      {/* Cards grid */}
      <div ref={container} className="flex-1 overflow-y-auto p-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((workspace, i) => (
              <Link
                key={workspace.id}
                href={`/dashboard/${workspace.id}/editor`}
                className="gsap-card group flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-black/10"
              >
                {/* Card thumbnail */}
                <div
                  className={`relative flex h-40 w-full items-center justify-center ${CARD_PREVIEW_COLORS[i % CARD_PREVIEW_COLORS.length]}`}
                >
                  {/* Placeholder browser chrome */}
                  <div className="w-[80%] overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5">
                    <div className="flex items-center gap-1.5 border-b border-black/5 bg-canvas px-2 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-danger/60" />
                      <span className="h-2 w-2 rounded-full bg-[#F59E0B]/60" />
                      <span className="h-2 w-2 rounded-full bg-accent/60" />
                    </div>
                    <div className="flex flex-col gap-1.5 p-2.5">
                      <div className="h-2 w-3/4 rounded bg-ink/10" />
                      <div className="h-2 w-1/2 rounded bg-ink/6" />
                      <div className="mt-1 h-6 w-full rounded bg-ink/5" />
                    </div>
                  </div>
                </div>

                {/* Card meta */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{workspace.name}</p>
                    <p className="text-[11px] text-ink-faint">
                      Created {timeAgo(workspace.createdAt)}
                    </p>
                  </div>
                  <span className="ml-2 shrink-0 rounded-md bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft ring-1 ring-black/5">
                    Free
                  </span>
                </div>
              </Link>
            ))}

            {/* New project card */}
            <Link
              href="/dashboard/templates"
              className="gsap-card group flex h-full min-h-[11rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 bg-transparent text-ink-faint transition-all duration-200 hover:border-accent/40 hover:text-accent"
            >
              <span className="material-symbols-outlined text-[32px] transition-transform duration-200 group-hover:scale-110">
                add_circle
              </span>
              <span className="text-sm font-medium">New project</span>
            </Link>
          </div>
        ) : (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-ink-faint">
              folder_open
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink">No projects yet</p>
              <p className="mt-1 text-sm text-ink-soft">Create your first portfolio project to get started.</p>
            </div>
            <Link
              href="/dashboard/templates"
              className="mt-2 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-deep active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create project
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
