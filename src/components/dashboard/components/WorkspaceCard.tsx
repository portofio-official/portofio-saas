"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/workspace/types";
import { PreviewTemplateRenderer } from "@/templates/registry";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export function timeAgo(dateInput: string, locale: string): string {
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

export interface WorkspaceCardProps {
  workspace: Workspace;
  locale: string;
  index: number;
  onPreview: (workspace: Workspace) => void;
  onDuplicate: (workspaceId: string) => void;
  isDuplicating: boolean;
  onUnpublish: (workspaceId: string) => void;
  onDelete: (workspace: Workspace) => void;
}

export function WorkspaceCard({
  workspace,
  locale,
  index,
  onPreview,
  onDuplicate,
  isDuplicating,
  onUnpublish,
  onDelete,
}: WorkspaceCardProps) {
  const t = useTranslations("Dashboard");
  const [openMenu, setOpenMenu] = useState(false);

  const siteSubdomain =
    workspace.subdomain ?? workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const fullSiteUrl = `http://${ROOT_DOMAIN}/sites/${siteSubdomain}`;
  const isPublished = workspace.publishStatus === "published";

  return (
    <div
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
              <span className="truncate">{siteSubdomain}.portofio.app</span>
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
                onClick={() => onPreview(workspace)}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-soft shadow-sm transition-all duration-200 hover:bg-white hover:text-ink active:scale-[0.95]"
                title={t("preview")}
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </button>

              {isPublished ? (
                <button
                  type="button"
                  onClick={() => onUnpublish(workspace.id)}
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
                  setOpenMenu((prev) => !prev);
                }}
                className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-ink/[0.06] hover:text-ink"
                title={t("moreActions")}
              >
                <span className="material-symbols-outlined text-[16px]">more_vert</span>
              </button>

              {openMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(false)} />
                  <div className="absolute right-0 bottom-8 z-20 flex w-48 flex-col overflow-hidden rounded-xl bg-surface p-1 shadow-[var(--shadow-diffused)] ring-1 ring-black/5 animate-fade-in-up-custom">
                    <Link
                      href={`/dashboard/${workspace.id}/editor`}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      {t("edit")} Website
                    </Link>

                    <Link
                      href="/dashboard/content"
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
                      onClick={() => onDuplicate(workspace.id)}
                      disabled={isDuplicating}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      {isDuplicating ? t("duplicating") : t("duplicate")}
                    </button>

                    <div className="my-1 border-t border-black/5" />

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        onDelete(workspace);
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
}
