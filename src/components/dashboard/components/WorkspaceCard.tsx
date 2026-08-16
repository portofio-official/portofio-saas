"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/workspace";
import { PreviewTemplateRenderer } from "@/templates/registry";
import { useInView } from "@/hooks/useInView";

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
  recentViews: Map<string, number>;
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
  recentViews,
  onPreview,
  onDuplicate,
  isDuplicating,
  onUnpublish,
  onDelete,
}: WorkspaceCardProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const { ref: thumbnailRef, inView } = useInView<HTMLDivElement>();
  const siteSubdomain =
    workspace.subdomain ?? workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const fullSiteUrl = `http://${ROOT_DOMAIN}/sites/${siteSubdomain}`;
  const isPublished = workspace.publishStatus === "published";
  const viewCount = recentViews.get(workspace.id) ?? 0;
  const lastEdited = workspace.updatedAt ?? workspace.createdAt;

  useEffect(() => {
    if (!openMenu) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openMenu]);

  return (
    <div
      className="group relative flex flex-col gap-2.5 animate-fade-in-up-custom"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      {/* Thumbnail Container */}
      <div
        ref={thumbnailRef}
        className="relative h-[220px] sm:h-[240px] w-full overflow-hidden rounded-2xl bg-shell shadow-sm ring-1 ring-black/5 transition-all duration-200 ease-out group-hover:shadow-md group-hover:ring-black/15"
      >
        {/* Floating three-dots menu — top-right overlay on thumbnail */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
            className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-ink-soft shadow-xs ring-1 ring-black/10 backdrop-blur-sm transition-all duration-150 hover:bg-white hover:text-ink opacity-100 md:opacity-0 md:group-hover:opacity-100"
            title={t("moreActions")}
            aria-label={t("moreActions")}
            aria-haspopup="menu"
            aria-expanded={openMenu}
          >
            <span className="material-symbols-outlined text-[16px]">more_vert</span>
          </button>

          {openMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(false);
                }}
              />
              <div
                className="absolute right-0 top-full mt-1 z-40 flex w-48 flex-col overflow-hidden rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/10 animate-fade-in-up-custom text-left"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/dashboard/${workspace.id}/editor`}
                  role="menuitem"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  onClick={() => setOpenMenu(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  {t("edit")}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(false);
                    onPreview(workspace);
                  }}
                  role="menuitem"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {t("preview")}
                </button>

                {isPublished && fullSiteUrl ? (
                  <a
                    href={fullSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-accent-deep transition-colors hover:bg-accent/[0.08]"
                    onClick={() => setOpenMenu(false)}
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    {t("visitLiveSite")}
                  </a>
                ) : null}

                <Link
                  href="/dashboard/content"
                  role="menuitem"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  onClick={() => setOpenMenu(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  {t("contentLibrary")}
                </Link>

                {isPublished ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(false);
                      onUnpublish(workspace.id);
                    }}
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-warning transition-colors hover:bg-warning-soft"
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
                  role="menuitem"
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
                  role="menuitem"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-danger transition-colors hover:bg-danger/5"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  {t("delete")}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Live Website Canvas — a real <a> can't wrap the preview's own anchors, so this is a keyboard-accessible div */}
        <div
          role="link"
          tabIndex={0}
          title={workspace.name}
          aria-label={`${t("edit")}: ${workspace.name}`}
          onClick={() => router.push(`/dashboard/${workspace.id}/editor`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(`/dashboard/${workspace.id}/editor`);
            }
          }}
          className="relative block h-full w-full overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <div
            className="pointer-events-none absolute inset-0 origin-top-left transition-transform duration-300 ease-out group-hover:scale-[1.015]"
            style={{ transform: "scale(0.33)", width: "303%", height: "303%" }}
          >
            {inView && (
              <PreviewTemplateRenderer
                templateId={workspace.preview?.templateId ?? "minimal"}
                data={workspace.preview?.data ?? {}}
              />
            )}
          </div>

          {/* Published live dot overlay */}
          {isPublished && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-accent-deep ring-1 ring-black/5 backdrop-blur-sm shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("live")}
            </div>
          )}
        </div>

        {/* Hover quick-action: Preview modal (desktop only — mobile uses the kebab menu) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPreview(workspace);
          }}
          title={t("preview")}
          aria-label={t("preview")}
          className="absolute bottom-2.5 right-2.5 z-20 hidden h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-soft ring-1 ring-black/10 backdrop-blur-sm transition-all duration-150 opacity-0 hover:bg-white hover:text-ink active:scale-95 md:grid md:group-hover:opacity-100"
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
        </button>
      </div>

      {/* Card Footer — name + last edited + 7-day views */}
      <div className="flex items-center justify-between px-1">
        <div className="min-w-0">
          <Link
            href={`/dashboard/${workspace.id}/editor`}
            className="block truncate font-display text-[14px] font-semibold text-ink hover:text-accent-deep transition-colors"
          >
            {workspace.name}
          </Link>
          <p className="mt-0.5 text-[12px] font-medium text-ink-faint">
            {viewCount > 0 ? (
              <>
                {t("editedLabel")} {timeAgo(lastEdited, locale)}
                <span className="mx-1.5">·</span>
                {viewCount.toLocaleString(locale)} {t("viewsLabel")} {t("views7d")}
              </>
            ) : (
              <>
                {t("editedLabel")} {timeAgo(lastEdited, locale)}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
