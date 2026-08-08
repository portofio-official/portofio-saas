/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
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
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [previewWorkspace, setPreviewWorkspace] = useState<Workspace | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Keyboard shortcut listener: Cmd/Ctrl + K focuses search bar
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

  const lastUpdatedText = latestWorkspace ? timeAgo(latestWorkspace.createdAt) : "Never";

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
      if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    // No window.confirm() — deletion is triggered from a UI confirmation state in JSX
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
    <div className="flex h-full flex-col bg-white overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-[#E5E7EB] bg-white px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title & Metadata */}
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#111827]">{t("title")}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] font-medium text-[#6B7280]">
              <span>{totalCount} {t("totalLabel")}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span className="text-[#059669] font-semibold">{publishedCount} {t("publishedLabel")}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span>{draftCount} {t("draftLabel")}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span>{t("updatedLabel")} {lastUpdatedText}</span>
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search input with ⌘K */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[16px] text-[#9CA3AF]">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 sm:w-56 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-12 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#00cf7c] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00cf7c] transition-all"
              />
              <span className="absolute right-2.5 flex items-center gap-0.5 rounded-md border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#9CA3AF] shadow-2xs pointer-events-none">
                ⌘K
              </span>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowFilterDropdown((v) => !v);
                  setShowSortDropdown(false);
                }}
                className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-all ${
                  filterBy !== "all"
                    ? "border-[#00cf7c] bg-[#e6faf2] text-[#00b368] font-semibold"
                    : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
                }`}
              >
                <span className={`material-symbols-outlined text-[16px] ${filterBy !== "all" ? "text-[#00b368]" : "text-[#6B7280]"}`}>filter_list</span>
                <span>{filterBy === "all" ? "Filter" : filterBy === "published" ? "Published" : "Draft"}</span>
                <span className={`material-symbols-outlined text-[16px] ${filterBy !== "all" ? "text-[#00b368]" : "text-[#9CA3AF]"}`}>expand_more</span>
              </button>

              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                  <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterBy("all");
                        setShowFilterDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                        filterBy === "all" ? "bg-[#e6faf2] text-[#00b368] font-bold" : "text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      All Statuses
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterBy("published");
                        setShowFilterDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                        filterBy === "published" ? "bg-[#e6faf2] text-[#00b368] font-bold" : "text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterBy("draft");
                        setShowFilterDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                        filterBy === "draft" ? "bg-[#e6faf2] text-[#00b368] font-bold" : "text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSortDropdown((v) => !v);
                  setShowFilterDropdown(false);
                }}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6B7280]">sort</span>
                <span>{sortBy === "updated" ? "Last edited" : sortBy === "name" ? "Name" : "Date created"}</span>
                <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">expand_more</span>
              </button>

              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("updated");
                        setShowSortDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                        sortBy === "updated" ? "bg-[#e6faf2] text-[#00b368] font-bold" : "text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      Last edited
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("name");
                        setShowSortDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                        sortBy === "name" ? "bg-[#e6faf2] text-[#00b368] font-bold" : "text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      Name
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy("created");
                        setShowSortDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                        sortBy === "created" ? "bg-[#e6faf2] text-[#00b368] font-bold" : "text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      Date created
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Primary CTA: New Website */}
            <Link
              href="/dashboard/templates"
              className="flex h-9 items-center gap-2 rounded-xl bg-[#00cf7c] hover:bg-[#00b368] px-4 text-[13px] font-bold text-white shadow-[0_4px_14px_0_rgba(0,207,124,0.35)] transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Website</span>
            </Link>

          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Website Cards */}
            {filteredWorkspaces.map((workspace) => {
              const siteSubdomain = workspace.subdomain ?? workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
              const fullSiteUrl = `http://${ROOT_DOMAIN}/sites/${siteSubdomain}`;

              return (
                <div
                  key={workspace.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-md"
                >
                  {/* Miniature Browser Chrome Preview */}
                  <div className="relative flex flex-col bg-[#F9FAFB]">
                    {/* macOS Browser Header Frame */}
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/80" />
                      </div>
                      {/* URL Bar */}
                      <div className="flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-[10px] font-mono text-[#6B7280] truncate max-w-[160px]">
                        <span className="material-symbols-outlined text-[10px] text-[#9CA3AF]">lock</span>
                        <span className="truncate">{siteSubdomain}.portofio.app</span>
                      </div>
                      <div className="w-8" />
                    </div>

                    {/* Miniature Browser Body Canvas */}
                    <div className="relative flex h-[180px] w-full items-center justify-center overflow-hidden bg-[#F9FAFB]">
                      {workspace.preview ? (
                        <div
                          className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ transform: "scale(0.33)", width: "303%", height: "303%" }}
                        >
                          <PreviewTemplateRenderer
                            templateId={workspace.preview.templateId}
                            data={workspace.preview.data}
                          />
                        </div>
                      ) : (
                        <div className="relative w-[70%] rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-xs transition-transform duration-300 group-hover:scale-105">
                          <div className="mb-2 h-2 w-1/3 rounded-full bg-[#E5E7EB]" />
                          <div className="mb-2 h-14 w-full rounded-md bg-[#F3F4F6]" />
                          <div className="flex gap-2">
                            <div className="h-8 w-1/2 rounded-md bg-[#F3F4F6]" />
                            <div className="h-8 w-1/2 rounded-md bg-[#F3F4F6]" />
                          </div>
                        </div>
                      )}

                      {/* Card Hover Actions Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#111827]/40 backdrop-blur-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 p-4">
                        {/* Edit Action */}
                        <Link
                          href={`/dashboard/${workspace.id}/editor`}
                          className="flex h-9 items-center gap-1.5 rounded-xl bg-[#00cf7c] hover:bg-[#00b368] px-3 text-[12px] font-bold text-white shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Edit</span>
                        </Link>


                        {/* Quick Preview Action */}
                        <button
                          type="button"
                          onClick={() => setPreviewWorkspace(workspace)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#374151] shadow-sm hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
                          title="Preview Website"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>

                        {/* Publish / Unpublish Action */}
                        {workspace.publishStatus === "published" ? (
                          <button
                            type="button"
                            onClick={() => handleUnpublish(workspace.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#D97706] shadow-sm hover:bg-[#FFFBEB] transition-colors"
                            title="Unpublish Website"
                          >
                            <span className="material-symbols-outlined text-[18px]">cloud_off</span>
                          </button>
                        ) : (
                          <Link
                            href={`/dashboard/${workspace.id}/editor`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#059669] shadow-sm hover:bg-[#ECFDF5] transition-colors"
                            title="Publish Website"
                          >
                            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Website Card Info Footer */}
                  <div className="flex flex-col border-t border-[#E5E7EB] bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold text-[#111827]">{workspace.name}</p>

                      {/* Status Badge */}
                      {workspace.publishStatus === "published" ? (
                        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-0.5 text-[10px] font-semibold text-[#4B5563] uppercase tracking-wider">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[12px] font-normal text-[#6B7280]">
                        Edited {timeAgo(workspace.createdAt)}
                      </p>

                      {/* Card More Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenMenuId(openMenuId === workspace.id ? null : workspace.id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                          title="More Actions"
                        >
                          <span className="material-symbols-outlined text-[16px]">more_vert</span>
                        </button>

                        {openMenuId === workspace.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 bottom-8 z-20 flex w-44 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-md">
                              <Link
                                href={`/dashboard/${workspace.id}/editor`}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#6B7280]">edit</span>
                                Edit Website
                              </Link>

                              {workspace.publishStatus === "published" && workspace.subdomain && (
                                <a
                                  href={fullSiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-[#059669] hover:bg-[#ECFDF5] transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                  Visit Live Site
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDuplicate(workspace.id)}
                                disabled={isDuplicating === workspace.id}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#6B7280]">content_copy</span>
                                {isDuplicating === workspace.id ? "Duplicating..." : "Duplicate"}
                              </button>

                              <div className="my-1 border-t border-[#F3F4F6]" />

                              <button
                                type="button"
                                onClick={() => handleDelete(workspace)}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-[#DC2626] hover:bg-[#FFEFEE] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* New Website Card (Dashed Placeholder) */}
            <Link
              href="/dashboard/templates"
              className="group flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB]/50 p-6 text-center transition-all hover:border-[#00cf7c] hover:bg-white hover:shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB]/60 text-[#4B5563] transition-colors group-hover:bg-[#00cf7c] group-hover:text-white">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#00b368]">
                  Create Website
                </p>
                <p className="mt-0.5 text-[12px] font-normal text-[#6B7280] max-w-[200px]">
                  Start from a professionally designed template
                </p>
              </div>
            </Link>
          </div>
        ) : (
          /* Search / Filter Empty State */
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <span className="material-symbols-outlined text-[36px] text-[#9CA3AF]">search_off</span>
            <div>
              <p className="text-[16px] font-semibold text-[#111827]">No matching websites</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                No websites match &quot;{search}&quot;. Try adjusting your filters or search term.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterBy("all");
              }}
              className="mt-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Website Preview Modal Overlay */}
      {previewWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-bold text-[#111827]">{previewWorkspace.name}</span>
                {previewWorkspace.publishStatus === "published" ? (
                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-bold text-[#059669] uppercase">
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[10px] font-semibold text-[#4B5563] uppercase">
                    Draft Preview
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/${previewWorkspace.id}/editor`}
                  className="flex items-center gap-1.5 rounded-xl bg-[#00cf7c] hover:bg-[#00b368] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-[0_4px_10px_rgba(0,207,124,0.25)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Open Editor
                </Link>

                <button
                  type="button"
                  onClick={() => setPreviewWorkspace(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body Preview */}
            <div className="relative flex-1 overflow-auto bg-[#F9FAFB] p-6">
              {previewWorkspace.preview ? (
                <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-md">
                  <PreviewTemplateRenderer
                    templateId={previewWorkspace.preview.templateId}
                    data={previewWorkspace.preview.data}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[#6B7280] text-[14px]">
                  No preview available. Open editor to add content.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
