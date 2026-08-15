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

  return (
    <div className="flex flex-col gap-3.5 border-t border-black/5 pt-4 pb-1">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input with ⌘K */}
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[16px] text-ink-faint pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-full bg-ink/[0.04] pl-9 pr-12 text-[13px] font-medium text-ink ring-1 ring-black/5 placeholder:text-ink-faint transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface"
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
            <span className="absolute right-3 hidden sm:flex items-center gap-0.5 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-mono text-ink-faint ring-1 ring-black/5 pointer-events-none">
              ⌘K
            </span>
          )}
        </div>

        {/* Right side controls: Filter Pills + Sort + Grid/List Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Filter segmented control */}
          <div className="flex items-center gap-1 rounded-full bg-ink/[0.05] p-1 ring-1 ring-black/5 shrink-0">
            {filterOptions.map((opt) => {
              const isSelected = filterBy === opt.value;
              const count =
                opt.value === "all" ? totalCount : opt.value === "published" ? publishedCount : draftCount;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFilterChange(opt.value)}
                  className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-surface text-ink ring-1 ring-black/5"
                      : "text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {opt.tone === "live" && opt.value === "published" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                  <span>{opt.label}</span>
                  <span
                    className={`font-mono text-[10px] font-semibold ${
                      isSelected ? "text-accent-deep" : "text-ink-faint"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown((v) => !v)}
                className={`flex h-8 sm:h-9 items-center gap-1 rounded-full px-3 text-[12px] font-medium transition-all duration-200 ${
                  showSortDropdown
                    ? "bg-ink/[0.08] text-ink ring-1 ring-black/10"
                    : "bg-ink/[0.04] text-ink-soft ring-1 ring-black/5 hover:bg-ink/[0.06] hover:text-ink"
                }`}
                aria-expanded={showSortDropdown}
              >
                <span className="material-symbols-outlined text-[16px] text-ink-faint">sort</span>
                <span className="hidden md:inline">
                  {sortOptions.find((s) => s.value === sortBy)?.label}
                </span>
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
                  <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5 animate-fade-in-up-custom">
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

            {/* View Mode Switcher (Grid vs List) */}
            <div className="flex items-center gap-0.5 rounded-full bg-ink/[0.05] p-1 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                aria-label={t("viewGrid")}
                title={t("viewGrid")}
                className={`grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-surface text-ink ring-1 ring-black/5"
                    : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                aria-label={t("viewList")}
                title={t("viewList")}
                className={`grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-surface text-ink ring-1 ring-black/5"
                    : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
