/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Workspace } from "@/lib/workspace";
import { useToast } from "@/components/ui/Toast";
import { type SortOption, type FilterOption } from "./components/DashboardToolbar";
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
  const [filterBy] = useState<FilterOption>("all");
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "updated", label: t("sortUpdated") },
    { value: "name", label: t("sortName") },
    { value: "created", label: t("sortCreated") },
  ];
  const currentSortLabel = sortOptions.find((s) => s.value === sortBy)?.label ?? t("sortUpdated");

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
      if (sortBy === "name") return a.name.localeCompare(b.name);
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
      {/* ── Top Header ── */}
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: "All" heading */}
          <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
            {t("allProjects")}
          </h1>

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            {/* Search icon → expands inline */}
            <div className="flex items-center">
              {showSearch ? (
                <div className="flex items-center gap-1.5 rounded-full bg-ink/[0.04] ring-1 ring-black/5 pl-3 pr-1.5 h-9 transition-all duration-200">
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
                    aria-label="Close search"
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
                  <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5 animate-fade-in-up-custom">
                    <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      {t("sortLabel")}
                    </p>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
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
