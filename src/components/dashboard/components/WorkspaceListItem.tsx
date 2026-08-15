"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/workspace";
import { PreviewTemplateRenderer } from "@/templates/registry";
import { timeAgo } from "./WorkspaceCard";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export interface WorkspaceListItemProps {
  workspace: Workspace;
  locale: string;
  onPreview: (workspace: Workspace) => void;
  onDuplicate: (workspaceId: string) => void;
  isDuplicating: boolean;
  onUnpublish: (workspaceId: string) => void;
  onDelete: (workspace: Workspace) => void;
  isMobileView?: boolean;
}

export function WorkspaceListItem({
  workspace,
  locale,
  onPreview,
  onDuplicate,
  isDuplicating,
  onUnpublish,
  onDelete,
  isMobileView = false,
}: WorkspaceListItemProps) {
  const t = useTranslations("Dashboard");
  const [openMenu, setOpenMenu] = useState(false);

  const siteSubdomain =
    workspace.subdomain ?? workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const fullSiteUrl = `http://${ROOT_DOMAIN}/sites/${siteSubdomain}`;
  const isPublished = workspace.publishStatus === "published";

  const templateName = workspace.preview?.templateId
    ? workspace.preview.templateId.charAt(0).toUpperCase() + workspace.preview.templateId.slice(1)
    : "Standard";

  const menuDropdown = (
    <>
      <div className="fixed inset-0 z-20" onClick={() => setOpenMenu(false)} />
      <div className="absolute right-0 bottom-8 z-30 flex w-48 flex-col overflow-hidden rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5 animate-fade-in-up-custom text-left">
        <Link
          href={`/dashboard/${workspace.id}/editor`}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
          onClick={() => setOpenMenu(false)}
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          {t("edit")} Website
        </Link>

        <Link
          href="/dashboard/content"
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
          onClick={() => setOpenMenu(false)}
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
            onClick={() => setOpenMenu(false)}
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            {t("visitLiveSite")}
          </a>
        )}

        {isPublished ? (
          <button
            type="button"
            onClick={() => {
              setOpenMenu(false);
              onUnpublish(workspace.id);
            }}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-[#D97706] transition-colors hover:bg-[#FFFBEB]"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_off</span>
            {t("unpublish")}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setOpenMenu(false);
            onDuplicate(workspace.id);
          }}
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
  );

  if (isMobileView) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-surface hover:bg-shell/40 transition-colors select-none">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-shell ring-1 ring-black/5">
              <div
                className="pointer-events-none absolute inset-0 origin-top-left"
                style={{ transform: "scale(0.14)", width: "714%", height: "714%" }}
              >
                <PreviewTemplateRenderer
                  templateId={workspace.preview?.templateId ?? "minimal"}
                  data={workspace.preview?.data ?? {}}
                />
              </div>
            </div>

            <div className="min-w-0">
              <Link
                href={`/dashboard/${workspace.id}/editor`}
                className="block truncate font-display text-[14px] font-bold text-ink hover:text-accent-deep"
              >
                {workspace.name}
              </Link>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
                <span className="material-symbols-outlined text-[13px]">palette</span>
                <span>{templateName}</span>
                <span>•</span>
                <span>{timeAgo(workspace.createdAt, locale)}</span>
              </div>
            </div>
          </div>

          {isPublished ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent-deep ring-1 ring-accent/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("live")}
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-ink/[0.05] px-2 py-0.5 text-[10px] font-semibold text-ink-faint ring-1 ring-black/5">
              {t("filterDraft")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5">
          <div className="truncate font-mono text-[11px] text-ink-soft">
            {siteSubdomain}.portofio.app
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={`/dashboard/${workspace.id}/editor`}
              className="flex h-7 items-center gap-1 rounded-md bg-accent/10 px-2.5 text-[11px] font-bold text-accent-deep hover:bg-accent hover:text-white transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              <span>{t("edit")}</span>
            </Link>

            <button
              type="button"
              onClick={() => onPreview(workspace)}
              className="grid h-7 w-7 place-items-center rounded-md bg-ink/[0.04] text-ink-soft hover:bg-ink/[0.08]"
              title={t("preview")}
            >
              <span className="material-symbols-outlined text-[15px]">visibility</span>
            </button>

            {isPublished && (
              <a
                href={fullSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-7 w-7 place-items-center rounded-md bg-accent/10 text-accent-deep hover:bg-accent/20"
                title={t("visitLiveSite")}
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenMenu((prev) => !prev);
                }}
                className="grid h-7 w-7 place-items-center rounded-md text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
                title={t("moreActions")}
              >
                <span className="material-symbols-outlined text-[15px]">more_vert</span>
              </button>
              {openMenu && menuDropdown}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="group transition-colors hover:bg-shell/50">
      {/* Thumbnail + Project Name & Template */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-shell ring-1 ring-black/5 shadow-2xs">
            <div
              className="pointer-events-none absolute inset-0 origin-top-left"
              style={{ transform: "scale(0.12)", width: "833%", height: "833%" }}
            >
              <PreviewTemplateRenderer
                templateId={workspace.preview?.templateId ?? "minimal"}
                data={workspace.preview?.data ?? {}}
              />
            </div>
          </div>

          <div className="min-w-0">
            <Link
              href={`/dashboard/${workspace.id}/editor`}
              className="block truncate font-display text-[14px] font-bold text-ink transition-colors hover:text-accent-deep"
            >
              {workspace.name}
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
              <span className="material-symbols-outlined text-[13px]">palette</span>
              <span>{templateName}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-6 py-4 whitespace-nowrap">
        {isPublished ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold text-accent-deep ring-1 ring-accent/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {t("live")}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-ink-faint ring-1 ring-black/5">
            {t("filterDraft")}
          </span>
        )}
      </td>

      {/* Domain Address */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-mono text-[12px] text-ink-soft">
          {isPublished ? (
            <span className="material-symbols-outlined text-[13px] text-accent-deep">lock</span>
          ) : (
            <span className="material-symbols-outlined text-[13px] text-ink-faint">edit_note</span>
          )}
          {isPublished ? (
            <a
              href={fullSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate transition-colors hover:text-accent-deep hover:underline"
            >
              {siteSubdomain}.portofio.app
            </a>
          ) : (
            <span className="truncate text-ink-faint">{siteSubdomain}.portofio.app</span>
          )}
        </div>
      </td>

      {/* Last Edited Timestamp */}
      <td className="px-6 py-4 whitespace-nowrap text-[12px] font-medium text-ink-faint">
        {timeAgo(workspace.createdAt, locale)}
      </td>

      {/* Quick Action Buttons */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {/* Edit Button Pill */}
          <Link
            href={`/dashboard/${workspace.id}/editor`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent/10 px-3 text-[12px] font-bold text-accent-deep ring-1 ring-accent/20 transition-all duration-200 hover:bg-accent hover:text-white active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            {t("edit")}
          </Link>

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(workspace)}
            className="grid h-8 w-8 place-items-center rounded-full bg-surface text-ink-soft ring-1 ring-black/5 transition-all duration-200 hover:bg-ink/[0.05] hover:text-ink active:scale-[0.95]"
            title={t("preview")}
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpenMenu((prev) => !prev);
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-faint ring-1 ring-black/5 transition-colors hover:bg-ink/[0.05] hover:text-ink"
              title={t("moreActions")}
            >
              <span className="material-symbols-outlined text-[16px]">more_vert</span>
            </button>

            {openMenu && menuDropdown}
          </div>
        </div>
      </td>
    </tr>
  );
}
