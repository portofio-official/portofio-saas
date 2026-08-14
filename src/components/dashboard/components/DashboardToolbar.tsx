"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type SortOption = "updated" | "name" | "created";
export type FilterOption = "all" | "published" | "draft";
export type ViewMode = "grid" | "list";

export interface DashboardToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filterBy: FilterOption;
  onFilterChange: (val: FilterOption) => void;
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (val: ViewMode) => void;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  lastUpdatedText: string;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function DashboardToolbar({
  search,
  onSearchChange,
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  publishedCount,
  draftCount,
  lastUpdatedText,
  searchInputRef,
}: DashboardToolbarProps) {
  const t = useTranslations("Dashboard");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
    <div className="flex flex-col gap-3 border-t border-black/5 py-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Stat chips */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input with ⌘K */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[16px] text-ink-faint pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-48 sm:w-56 rounded-full bg-ink/[0.04] pl-9 pr-12 text-[13px] font-medium text-ink ring-1 ring-transparent placeholder:text-ink-faint transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:bg-surface"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 grid h-5 w-5 place-items-center rounded-full text-ink-faint hover:bg-ink/10 hover:text-ink transition-colors"
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
              onClick={() => onFilterChange(opt.value)}
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
            <span className="hidden sm:inline">
              {sortOptions.find((s) => s.value === sortBy)?.label}
            </span>
            <span
              className={`material-symbols-outlined text-[16px] text-ink-faint transition-transform duration-200 ${
                showSortDropdown ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {showSortDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
              <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl bg-surface p-1 shadow-[var(--shadow-diffused)] ring-1 ring-black/5 animate-fade-in-up-custom">
                <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {t("sortLabel")}
                </p>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
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

        {/* View Mode Switcher (Grid vs List) */}
        <div className="flex items-center gap-0.5 rounded-full bg-ink/[0.05] p-1 ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label={t("viewGrid")}
            title={t("viewGrid")}
            className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-surface text-ink shadow-xs ring-1 ring-black/5"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label={t("viewList")}
            title={t("viewList")}
            className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-200 ${
              viewMode === "list"
                ? "bg-surface text-ink shadow-xs ring-1 ring-black/5"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">view_list</span>
          </button>
        </div>
      </div>
    </div>
  );
}
