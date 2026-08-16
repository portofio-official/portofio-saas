"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Workspace } from "@/lib/workspace";
import { useToast } from "@/components/ui/Toast";
import { WorkspaceGrid } from "./components/WorkspaceGrid";
import { QuickPreviewModal } from "./components/QuickPreviewModal";

type SortOption = "updated" | "name" | "created";

export function DashboardClientView({
  workspaces,
  recentViews,
}: {
  workspaces: Workspace[];
  recentViews: Map<string, number>;
}) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [showSearch, setShowSearch] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [previewWorkspace, setPreviewWorkspace] = useState<Workspace | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Workspace | null>(null);

  // Focus search input when revealed
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Keyboard shortcut: Cmd/Ctrl + K toggles search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch((v) => {
          if (!v) return true;
          searchInputRef.current?.focus();
          return v;
        });
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearch("");
      }
      if (e.key === "Escape" && showSortDropdown) {
        setShowSortDropdown(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch, showSortDropdown]);

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "updated", label: t("sortUpdated") },
    { value: "name", label: t("sortName") },
    { value: "created", label: t("sortCreated") },
  ];
  const currentSortLabel = sortOptions.find((s) => s.value === sortBy)?.label ?? t("sortUpdated");

  // Filter and sort items
  const filteredWorkspaces = workspaces
    .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "updated") {
        const au = a.updatedAt ?? a.createdAt;
        const bu = b.updatedAt ?? b.createdAt;
        return new Date(bu).getTime() - new Date(au).getTime();
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
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      {/* ── Top Header ── */}
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 sm:px-8 pt-6 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-4">
          {/* Left: eyebrow + title + subtitle */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-deep ring-1 ring-accent/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("eyebrow")}
              {workspaces.length > 0 && (
                <span className="ml-0.5 rounded-full bg-accent/15 px-1.5 py-px text-[9px] font-bold tabular-nums tracking-normal">
                  {workspaces.length}
                </span>
              )}
            </span>
            <h1 className="mt-2.5 font-display text-[24px] font-bold tracking-tight text-ink text-balance sm:text-[28px]">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm font-medium text-ink-soft">{t("subtitle")}</p>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            {/* Search icon → expands inline */}
            <div className="flex items-center">
              {showSearch ? (
                <div className="flex items-center gap-1.5 rounded-full bg-ink/[0.04] ring-1 ring-black/5 pl-3 pr-1.5 h-9 transition-all duration-200 focus-within:ring-2 focus-within:ring-accent">
                  <span className="material-symbols-outlined text-[15px] text-ink-faint shrink-0">
                    search
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-36 sm:w-48 bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearch("");
                    }}
                    className="grid h-6 w-6 place-items-center rounded-full text-ink-faint hover:bg-ink/10 hover:text-ink transition-colors"
                    aria-label={t("closeSearch")}
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  aria-label={t("searchPlaceholder")}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-soft ring-1 ring-black/5 bg-ink/[0.04] transition-all duration-150 hover:bg-ink/[0.08] hover:text-ink"
                  title={`${t("searchPlaceholder")} (⌘K)`}
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown((v) => !v)}
                className="flex h-9 items-center gap-1.5 rounded-full bg-ink/[0.04] px-3.5 text-[13px] font-medium text-ink-soft ring-1 ring-black/5 transition-all duration-150 hover:bg-ink/[0.08] hover:text-ink"
                aria-expanded={showSortDropdown}
                aria-haspopup="menu"
                id="sort-dropdown-btn"
              >
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <span className="sm:hidden material-symbols-outlined text-[16px]">sort</span>
                <span
                  className={`material-symbols-outlined text-[15px] text-ink-faint transition-transform duration-200 ${
                    showSortDropdown ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
                  <div
                    className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5 animate-fade-in-up-custom"
                    role="menu"
                  >
                    <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      {t("sortLabel")}
                    </p>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={sortBy === opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                          sortBy === opt.value
                            ? "bg-accent/[0.1] text-accent-deep font-bold"
                            : "text-ink-soft hover:bg-ink/[0.04]"
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* New Project CTA */}
            <Link
              href="/dashboard/templates"
              id="new-project-btn"
              className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-accent px-4 text-[13px] font-bold text-white transition-all duration-200 hover:bg-accent-deep active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">{t("newWebsite")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {filteredWorkspaces.length > 0 ? (
          <WorkspaceGrid
            workspaces={filteredWorkspaces}
            locale={locale}
            recentViews={recentViews}
            onPreview={setPreviewWorkspace}
            onDuplicate={handleDuplicate}
            isDuplicating={isDuplicating}
            onUnpublish={handleUnpublish}
            onDelete={setDeleteCandidate}
          />
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
                  setShowSearch(false);
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
