"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "@/i18n/navigation";
import type { Workspace } from "@/lib/workspace/types";
import { LegacyTemplateRenderer } from "@/components/templates/registry";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

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
  workspaces,
}: {
  email: string;
  workspaces: Workspace[];
  dict: Dict;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [sortByName, setSortByName] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = workspaces
    .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortByName
        ? a.name.localeCompare(b.name)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "cubic-bezier(0.32,0.72,0,1)", delay: 0.1 }
      );
      gsap.fromTo(
        ".gsap-card",
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "cubic-bezier(0.32,0.72,0,1)", stagger: 0.1, delay: 0.2 }
      );
    },
    { scope: container }
  );

  return (
    <div ref={container} className="flex h-full flex-col">
      {/* Top bar */}
      <header className="gsap-header flex shrink-0 items-end justify-between border-b border-black/5 bg-surface/80 px-12 py-10 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[12px] font-bold tracking-widest uppercase text-ink-faint">
            <span>Workspaces</span>
            <span>/</span>
            <span className="text-ink-soft">My Workspace</span>
          </div>
          <h1 className="mt-2 font-display text-[28px] font-bold tracking-tight text-ink">Projects</h1>
          <p className="mt-1 text-[13px] font-medium text-ink-soft">Build, customize, and publish websites</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-[10px] bg-black/[0.03] px-3 py-2 ring-1 ring-transparent transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:bg-white focus-within:ring-black/10 focus-within:shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-ink-faint">search</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
          {/* Sort */}
          <button
            type="button"
            onClick={() => setSortByName((v) => !v)}
            className="group flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-ink-soft transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.03] hover:text-ink active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">sort</span>
            {sortByName ? "Name" : "Last viewed"}
          </button>
          {/* New project Button-in-Button */}
          <Link
            href="/dashboard/templates"
            className="group flex items-center gap-3 rounded-[1.25rem] bg-ink pl-5 pr-2 py-2 text-[13px] font-bold text-white shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1a1a1a] hover:shadow-md active:scale-[0.98]"
          >
            New Project
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:translate-x-1 group-hover:bg-white/20">
               <span className="material-symbols-outlined text-[16px]">add</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Cards grid (Macro Whitespace px-12 py-12) */}
      <div className="flex-1 overflow-y-auto bg-canvas px-12 pb-32 pt-12">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((workspace) => (
              // OUTER SHELL (Double-Bezel Architecture)
              <div
                key={workspace.id}
                className="gsap-card group relative flex flex-col overflow-hidden rounded-[2rem] bg-black/[0.02] p-1.5 ring-1 ring-black/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[0.98] hover:bg-black/[0.04]"
              >
                <Link
                  href={`/dashboard/${workspace.id}/editor`}
                  className="flex h-full w-full flex-col outline-none"
                >
                  {/* INNER CORE */}
                  <div className="flex flex-col h-full w-full overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-md">
                    {/* Card thumbnail */}
                    <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden bg-black/[0.02]">
                      {workspace.preview ? (
                        <div
                          className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
                          style={{ transform: "scale(0.35)", width: "285%", height: "285%" }}
                        >
                          <LegacyTemplateRenderer
                            templateId={workspace.preview.templateId}
                            data={workspace.preview.data}
                          />
                        </div>
                      ) : (
                        <>
                          {/* Subtle dot grid pattern */}
                          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#00000015 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

                          {/* Minimal wireframe placeholder — no project data yet */}
                          <div className="relative w-[70%] rounded-[12px] bg-white p-3 shadow-sm ring-1 ring-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                             <div className="mb-3 h-2 w-1/3 rounded-full bg-black/10" />
                             <div className="mb-2 h-16 w-full rounded-md bg-black/[0.03]" />
                             <div className="flex gap-2">
                               <div className="h-10 w-1/2 rounded-md bg-black/[0.03]" />
                               <div className="h-10 w-1/2 rounded-md bg-black/[0.03]" />
                             </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Card meta */}
                    <div className="flex flex-col border-t border-black/5 px-5 py-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="truncate font-display text-[15px] font-bold tracking-tight text-ink">{workspace.name}</p>
                        {workspace.publishStatus === "published" ? (
                          <span className="flex items-center gap-1 shrink-0 rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-positive">
                            <span className="h-1 w-1 rounded-full bg-positive" />
                            Live
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink-soft">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-ink-faint">
                          Edited {timeAgo(workspace.createdAt)}
                        </p>
                        {workspace.publishStatus === "published" && workspace.subdomain && (
                          <a
                            href={`http://${workspace.subdomain}.${ROOT_DOMAIN}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-medium text-positive hover:underline"
                          >
                            View site ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Contextual menu (Visible on hover) */}
                <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenuId((id) => (id === workspace.id ? null : workspace.id));
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm ring-1 ring-black/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-ink hover:scale-110 active:scale-95"
                    title="More options"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>

                  {openMenuId === workspace.id && (
                    <>
                      {/* Click-outside catcher */}
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); setOpenMenuId(null); }} />
                      <div className="absolute right-0 top-10 z-20 flex w-44 flex-col overflow-hidden rounded-[14px] bg-white p-1 shadow-md ring-1 ring-black/5">
                        {workspace.publishStatus === "published" && (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              setOpenMenuId(null);
                              const { unpublishWorkspaceProjectAction } = await import("@/lib/workspace/actions");
                              await unpublishWorkspaceProjectAction(workspace.id);
                              window.location.reload();
                            }}
                            className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:bg-black/[0.04]"
                          >
                            <span className="material-symbols-outlined text-[16px] text-ink-soft">cloud_off</span>
                            Unpublish site
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            setOpenMenuId(null);
                            if (confirm(`Delete ${workspace.name}?`)) {
                              const { deleteWorkspaceAction } = await import("@/lib/workspace/actions");
                              await deleteWorkspaceAction(workspace.id);
                              window.location.reload();
                            }
                          }}
                          className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-danger transition-colors hover:bg-danger/10"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Delete project
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* New project card (Nested structural) */}
            <Link
              href="/dashboard/templates"
              className="gsap-card group relative flex flex-col overflow-hidden rounded-[2rem] bg-transparent p-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[0.98]"
            >
              <div className="flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-4 rounded-[1.6rem] border border-dashed border-black/15 bg-transparent transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-black/30 group-hover:bg-black/[0.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-ink-soft transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:bg-black/10 group-hover:text-ink">
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <span className="text-[14px] font-bold tracking-tight text-ink-soft group-hover:text-ink">Create new project</span>
              </div>
            </Link>
          </div>
        ) : workspaces.length > 0 ? (
          // No search results
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <span className="material-symbols-outlined text-[48px] text-ink-faint/50">search_off</span>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-ink">No matches</p>
              <p className="mt-1 text-[13px] text-ink-soft">
                No projects match &quot;{search}&quot;. Try a different search.
              </p>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <span className="material-symbols-outlined text-[48px] text-ink-faint/50">
              grid_view
            </span>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-ink">No projects yet</p>
              <p className="mt-1 text-[13px] text-ink-soft">Create your first portfolio project to get started.</p>
            </div>
            <Link
              href="/dashboard/templates"
              className="mt-2 flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
