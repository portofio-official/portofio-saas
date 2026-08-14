/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Workspace } from "@/lib/workspace/types";
import { PreviewTemplateRenderer } from "@/templates/registry";
import { useToast } from "@/components/ui/Toast";

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

type SortOption = "updated" | "name" | "created";
type FilterOption = "all" | "published" | "draft";

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [previewWorkspace, setPreviewWorkspace] = useState<Workspace | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Workspace | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
    setOpenMenuId(null);
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
    setOpenMenuId(null);
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
    setOpenMenuId(null);
    try {
      const { deleteWorkspaceAction } = await import("@/lib/workspace/actions");
      await deleteWorkspaceAction(workspace.id);
      showToast(t("toastDelOk"), "info");
      router.refresh();
    } catch {
      showToast(t("toastDelErr"), "error");
    }
  };

  const filterOptions: { value: FilterOption; label: string; tone?: "live" | "draft" }[] = [
    { value: "all", label: t("filterAll") },
    { value: "published", label: t("filterPublished"), tone: "live" },
    { value: "draft", label: t("filterDraft") },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "updated", label: t("sortUpdated") },
    { value: "name", label: t("sortName") },
    { value: "created", label: t("sortCreated") },
  ];

  const statChips: { count: number; label: string; live?: boolean }[] = [
    { count: totalCount, label: t("totalLabel") },
    { count: publishedCount, label: t("publishedLabel"), live: true },
    { count: draftCount, label: t("draftLabel") },
  ];

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
          <div className="flex flex-col gap-3 border-t border-black/5 py-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Stat chips */}
            <div className="flex items-center gap-2">
              {statChips.map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 rounded-full bg-ink/[0.04] px-3.5 py-1.5 ring-1 ring-black/5 transition-colors hover:bg-ink/[0.06]"
                >
                  {chip.live ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                  ) : null}
                  <span
                    className={`font-mono text-[13px] font-semibold tabular-nums ${
                      chip.live ? "text-accent-deep" : "text-ink"
                    }`}
                  >
                    {chip.count}
                  </span>
                  <span className="text-[11px] font-medium text-ink-faint">{chip.label}</span>
                </div>
              ))}
              <div className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 sm:flex">
                <span className="text-[11px] font-medium text-ink-faint">
                  {t("updatedLabel")} {lastUpdatedText}
                </span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input with ⌘K */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[16px] text-ink-faint">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-52 rounded-full bg-ink/[0.04] pl-9 pr-12 text-[13px] font-medium text-ink ring-1 ring-transparent placeholder:text-ink-faint transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:bg-surface sm:w-56"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 grid h-5 w-5 place-items-center rounded-full text-ink-faint hover:bg-ink/10 hover:text-ink"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                ) : (
                  <span className="absolute right-3 flex items-center gap-0.5 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-mono text-ink-faint ring-1 ring-black/5 pointer-events-none">
                    ⌘K
                  </span>
                )}
              </div>

              {/* Filter segmented control */}
              <div className="flex items-center gap-0.5 rounded-full bg-ink/[0.05] p-1 ring-1 ring-black/5">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilterBy(opt.value)}
                    className={`flex h-7 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold transition-all duration-200 ${
                      filterBy === opt.value
                        ? "bg-surface text-ink shadow-xs ring-1 ring-black/5"
                        : "text-ink-faint hover:text-ink-soft"
                    }`}
                  >
                    {opt.tone === "live" && opt.value === "published" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown((v) => !v)}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-all duration-200 ${
                    showSortDropdown
                      ? "bg-ink/[0.06] text-ink ring-1 ring-inset ring-ink/10"
                      : "bg-ink/[0.04] text-ink-soft ring-1 ring-black/5 hover:bg-ink/[0.06] hover:text-ink"
                  }`}
                  aria-expanded={showSortDropdown}
                >
                  <span className="material-symbols-outlined text-[17px] text-ink-faint">sort</span>
                  <span className="hidden sm:inline">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
                  <span className={`material-symbols-outlined text-[16px] text-ink-faint transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl bg-surface p-1 shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
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
                              ? "bg-accent/[0.1] text-accent-deep font-semibold"
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Website Cards: Double-Bezel Nested Architecture */}
            {filteredWorkspaces.map((workspace, index) => {
              const siteSubdomain = workspace.subdomain ?? workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
              const fullSiteUrl = `http://${ROOT_DOMAIN}/sites/${siteSubdomain}`;
              const isPublished = workspace.publishStatus === "published";

              return (
                <div
                  key={workspace.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] animate-fade-in-up-custom"
                  style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
                >
                  <div className="flex-1 flex flex-col overflow-hidden rounded-[1.4rem] bg-surface shadow-sm ring-1 ring-black/5">
                    {/* Miniature Browser Chrome */}
                    <div className="relative flex flex-col bg-shell">
                      <div className="flex items-center justify-between gap-2 border-b border-black/5 bg-shell px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#FF5F56]/80" />
                          <span className="h-2 w-2 rounded-full bg-[#FFBD2E]/80" />
                          <span className="h-2 w-2 rounded-full bg-[#27C93F]/80" />
                        </div>
                        <div className="flex min-w-0 items-center gap-1 rounded-md bg-surface px-2.5 py-1 text-[10px] font-mono text-ink-faint ring-1 ring-black/5">
                          {isPublished ? (
                            <span className="material-symbols-outlined text-[11px] text-accent-deep">lock</span>
                          ) : (
                            <span className="material-symbols-outlined text-[11px]">edit_note</span>
                          )}
                          <span className="truncate">
                            {siteSubdomain}.portofio.app
                          </span>
                        </div>
                        <div className="w-7" />
                      </div>

                      {/* Preview Canvas */}
                      <div className="relative flex h-[185px] w-full items-center justify-center overflow-hidden bg-shell">
                        {workspace.preview ? (
                          <div
                            className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                            style={{ transform: "scale(0.33)", width: "303%", height: "303%" }}
                          >
                            <PreviewTemplateRenderer
                              templateId={workspace.preview.templateId}
                              data={workspace.preview.data}
                            />
                          </div>
                        ) : (
                          <div className="relative w-[72%] rounded-xl border border-black/5 bg-surface p-3.5 shadow-xs transition-transform duration-300 group-hover:scale-105">
                            <div className="mb-2 h-2.5 w-1/3 rounded-full bg-ink/[0.08]" />
                            <div className="mb-2 h-14 w-full rounded-md bg-shell" />
                            <div className="flex gap-2">
                              <div className="h-8 w-1/2 rounded-md bg-shell" />
                              <div className="h-8 w-1/2 rounded-md bg-shell" />
                            </div>
                          </div>
                        )}

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#111827]/55 backdrop-blur-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
                          <Link
                            href={`/dashboard/${workspace.id}/editor`}
                            className="flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-[12px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-accent-deep active:scale-[0.97]"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                            {t("edit")}
                          </Link>

                          <button
                            type="button"
                            onClick={() => setPreviewWorkspace(workspace)}
                            className="grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-soft shadow-sm transition-all duration-200 hover:bg-white hover:text-ink active:scale-[0.95]"
                            title={t("preview")}
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {isPublished ? (
                            <button
                              type="button"
                              onClick={() => handleUnpublish(workspace.id)}
                              className="grid h-10 w-10 place-items-center rounded-full bg-surface text-[#D97706] shadow-sm transition-all duration-200 hover:bg-[#FFFBEB] active:scale-[0.95]"
                              title={t("unpublish")}
                            >
                              <span className="material-symbols-outlined text-[18px]">cloud_off</span>
                            </button>
                          ) : (
                            <Link
                              href={`/dashboard/${workspace.id}/editor`}
                              className="grid h-10 w-10 place-items-center rounded-full bg-surface text-accent-deep shadow-sm transition-all duration-200 hover:bg-accent/10 active:scale-[0.95]"
                              title={t("publish")}
                            >
                              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex flex-col gap-2.5 border-t border-black/5 bg-surface p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-display text-[15px] font-bold text-ink">{workspace.name}</p>

                        {isPublished ? (
                          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent/[0.12] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-deep ring-1 ring-accent/20">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                            </span>
                            {t("live")}
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-ink/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint ring-1 ring-black/5">
                            {t("filterDraft")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-ink-faint">
                          {t("editedLabel")} {timeAgo(workspace.createdAt, locale)}
                        </p>

                        {/* Card More Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenMenuId(openMenuId === workspace.id ? null : workspace.id);
                            }}
                            className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-ink/[0.06] hover:text-ink"
                            title={t("moreActions")}
                          >
                            <span className="material-symbols-outlined text-[16px]">more_vert</span>
                          </button>

                          {openMenuId === workspace.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 bottom-8 z-20 flex w-48 flex-col overflow-hidden rounded-xl bg-surface p-1 shadow-[var(--shadow-diffused)] ring-1 ring-black/5 animate-fade-in-up-custom">
                                <Link
                                  href={`/dashboard/${workspace.id}/editor`}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                  {t("edit")} Website
                                </Link>

                                <Link
                                  href={`/dashboard/content`}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                                >
                                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                                  {t("contentLibrary")}
                                </Link>

                                {isPublished && workspace.subdomain && (
                                  <a
                                    href={fullSiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-accent-deep transition-colors hover:bg-accent/[0.08]"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    {t("visitLiveSite")}
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDuplicate(workspace.id)}
                                  disabled={isDuplicating === workspace.id}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                                >
                                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                  {isDuplicating === workspace.id ? t("duplicating") : t("duplicate")}
                                </button>

                                <div className="my-1 border-t border-black/5" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeleteCandidate(workspace);
                                  }}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-danger transition-colors hover:bg-danger/5"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                  {t("delete")}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create Website Card (Double Bezel Dashed) */}
            <Link
              href="/dashboard/templates"
              className="group flex min-h-[220px] flex-col overflow-hidden rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] animate-fade-in-up-custom"
              style={{ animationDelay: `${Math.min(filteredWorkspaces.length * 45, 360)}ms` }}
            >
              <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3.5 rounded-[1.4rem] border-2 border-dashed border-black/10 bg-surface px-6 py-8 text-center transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/[0.02]">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white shadow-xs group-hover:shadow-[0_8px_20px_rgba(0,207,124,0.4)]">
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <div>
                  <p className="font-display text-[15px] font-bold text-ink transition-colors duration-200 group-hover:text-accent-deep">
                    {t("createWebsite")}
                  </p>
                  <p className="mt-1 max-w-[220px] text-[12px] font-normal text-ink-soft">
                    {t("createWebsiteDesc")}
                  </p>
                </div>
              </div>
            </Link>
          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-md animate-fade-in-up-custom">
          <div className="relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-black/5">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-shell px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <h3 className="truncate font-display text-[18px] font-bold leading-none tracking-tight text-ink">
                  {previewWorkspace.name}
                </h3>
                {previewWorkspace.publishStatus === "published" ? (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent/[0.12] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-deep ring-1 ring-accent/20">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    {t("live")}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-ink/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint ring-1 ring-black/5">
                    {t("draftPreview")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  href={`/dashboard/${previewWorkspace.id}/editor`}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-[12px] font-bold text-white shadow-[0_8px_18px_-6px_rgba(0,207,124,0.5)] transition-all duration-200 hover:bg-accent-deep active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  {t("openEditor")}
                </Link>

                <button
                  type="button"
                  onClick={() => setPreviewWorkspace(null)}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
                  aria-label={t("close")}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="relative flex-1 overflow-auto bg-shell p-6">
              {previewWorkspace.preview ? (
                <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-surface shadow-md ring-1 ring-black/5">
                  <PreviewTemplateRenderer
                    templateId={previewWorkspace.preview.templateId}
                    data={previewWorkspace.preview.data}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink/[0.04] text-ink-faint ring-1 ring-black/5">
                    <span className="material-symbols-outlined text-[28px]">image_not_supported</span>
                  </div>
                  <p className="max-w-sm text-[13px] font-medium text-ink-soft">{t("previewPlaceholder")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
