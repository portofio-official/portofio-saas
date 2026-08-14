/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Workspace } from "@/lib/workspace/types";
import { useToast } from "@/components/ui/Toast";
import {
  DashboardToolbar,
  type SortOption,
  type FilterOption,
  type ViewMode,
} from "./components/DashboardToolbar";
import { WorkspaceGrid } from "./components/WorkspaceGrid";
import { WorkspaceListView } from "./components/WorkspaceListView";
import { QuickPreviewModal } from "./components/QuickPreviewModal";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

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

function timeAgo(dateInput: string, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffMs = new Date(dateInput).getTime() - Date.now();
  const secs = Math.round(diffMs / 1000);
  const mins = Math.round(secs / 60);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(months / 12);
  if (Math.abs(secs) < 60) return rtf.format(secs, "second");
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(years, "year");
}

export function DashboardClientView({
  workspaces,
  preferredTemplateId,
}: {
  email: string;
  workspaces: Workspace[];
  dict: Dict;
  preferredTemplateId?: string;
}) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMode = localStorage.getItem("portofio_dashboard_view_mode") as ViewMode | null;
        if (savedMode === "grid" || savedMode === "list") {
          return savedMode;
        }
      } catch {
        // ignore
      }
    }
    return "grid";
  });

  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [previewWorkspace, setPreviewWorkspace] = useState<Workspace | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Workspace | null>(null);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("portofio_dashboard_view_mode", mode);
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut listener: Cmd/Ctrl + K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute metadata counters
  const totalCount = workspaces.length;
  const publishedCount = workspaces.filter((w) => w.publishStatus === "published").length;
  const draftCount = totalCount - publishedCount;

  const latestWorkspace = [...workspaces].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const lastUpdatedText = latestWorkspace ? timeAgo(latestWorkspace.createdAt, locale) : "—";

  // Filter and sort items
  const filteredWorkspaces = workspaces
    .filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filterBy === "all"
          ? true
          : filterBy === "published"
          ? w.publishStatus === "published"
          : w.publishStatus !== "published";
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDuplicate = async (workspaceId: string) => {
    setIsDuplicating(workspaceId);
    try {
      const { duplicateWorkspaceAction } = await import("@/lib/workspace/actions");
      const res = await duplicateWorkspaceAction(workspaceId);
      if (res.error) {
        showToast(t("toastDupFail"), "error");
      } else {
        showToast(t("toastDupOk"), "success");
        router.refresh();
      }
    } catch {
      showToast(t("toastDupErr"), "error");
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleUnpublish = async (workspaceId: string) => {
    try {
      const { unpublishWorkspaceProjectAction } = await import("@/lib/workspace/actions");
      await unpublishWorkspaceProjectAction(workspaceId);
      showToast(t("toastUnpubOk"), "info");
      router.refresh();
    } catch {
      showToast(t("toastUnpubErr"), "error");
    }
  };

  const handleDelete = async (workspace: Workspace) => {
    try {
      const { deleteWorkspaceAction } = await import("@/lib/workspace/actions");
      await deleteWorkspaceAction(workspace.id);
      showToast(t("toastDelOk"), "info");
      router.refresh();
    } catch {
      showToast(t("toastDelErr"), "error");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface select-none">
      {/* Top Header */}
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 pt-6 sm:px-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
            <div className="min-w-0 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-deep ring-1 ring-accent/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {t("eyebrow")}
              </span>
              <h1 className="mt-2.5 font-display text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm font-medium text-ink-soft">{t("subtitle")}</p>
            </div>

            {/* Nested CTA: Button-in-Button Trailing Icon Architecture */}
            <Link
              href="/dashboard/templates"
              className="group relative flex h-11 shrink-0 items-center gap-3 rounded-full bg-accent pl-5 pr-2.5 text-[13px] font-bold text-white shadow-[0_10px_28px_-8px_rgba(0,207,124,0.55)] transition-all duration-300 hover:bg-accent-deep hover:shadow-[0_14px_32px_-6px_rgba(0,207,124,0.65)] active:scale-[0.98]"
            >
              <span>{t("newWebsite")}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/30">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </span>
            </Link>
          </div>

          {/* Stats + Tools Toolbar */}
          <DashboardToolbar
            search={search}
            onSearchChange={setSearch}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            totalCount={totalCount}
            publishedCount={publishedCount}
            draftCount={draftCount}
            lastUpdatedText={lastUpdatedText}
            searchInputRef={searchInputRef}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {filteredWorkspaces.length > 0 ? (
          viewMode === "grid" ? (
            <WorkspaceGrid
              workspaces={filteredWorkspaces}
              locale={locale}
              onPreview={setPreviewWorkspace}
              onDuplicate={handleDuplicate}
              isDuplicating={isDuplicating}
              onUnpublish={handleUnpublish}
              onDelete={setDeleteCandidate}
            />
          ) : (
            <WorkspaceListView
              workspaces={filteredWorkspaces}
              locale={locale}
              onPreview={setPreviewWorkspace}
              onDuplicate={handleDuplicate}
              isDuplicating={isDuplicating}
              onUnpublish={handleUnpublish}
              onDelete={setDeleteCandidate}
            />
          )
        ) : (
          /* Search / Filter Empty State */
          <div className="flex min-h-[340px] items-center justify-center">
            <div className="flex max-w-sm flex-col items-center gap-3 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/[0.1] text-accent-deep ring-1 ring-accent/20">
                <span className="material-symbols-outlined text-[32px]">search_off</span>
              </div>
              <div>
                <p className="font-display text-[17px] font-bold text-ink">{t("noResultsTitle")}</p>
                <p className="mt-1 text-[13px] font-medium text-ink-soft leading-relaxed">
                  {t("noResultsDesc", { search })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterBy("all");
                }}
                className="mt-2 h-9 rounded-full border border-black/10 bg-surface px-5 text-[12px] font-semibold text-ink-soft transition-all duration-200 hover:bg-ink/[0.05] hover:text-ink active:scale-[0.98]"
              >
                {t("clearFilters")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Website Preview Modal */}
      {previewWorkspace && (
        <QuickPreviewModal
          workspace={previewWorkspace}
          onClose={() => setPreviewWorkspace(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-md animate-fade-in-up-custom">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-5 flex items-start gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-danger/10 text-danger ring-1 ring-danger/20">
                <span className="material-symbols-outlined text-[22px]">delete</span>
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-ink">{t("confirmDeleteTitle")}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {t("confirmDeleteDesc", { name: deleteCandidate.name })}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const workspace = deleteCandidate;
                  setDeleteCandidate(null);
                  await handleDelete(workspace);
                }}
                className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-danger/90"
              >
                {t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
