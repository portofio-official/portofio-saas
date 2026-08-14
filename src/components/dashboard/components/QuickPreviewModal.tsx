"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/workspace/types";
import { PreviewTemplateRenderer } from "@/templates/registry";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export interface QuickPreviewModalProps {
  workspace: Workspace;
  onClose: () => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export function QuickPreviewModal({ workspace, onClose }: QuickPreviewModalProps) {
  const t = useTranslations("Dashboard");
  const [device, setDevice] = useState<DeviceMode>("desktop");

  const isPublished = workspace.publishStatus === "published";
  const siteSubdomain =
    workspace.subdomain ?? workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const fullSiteUrl = `http://${ROOT_DOMAIN}/sites/${siteSubdomain}`;

  // Keyboard shortcut listener: Escape key closes modal & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-3 sm:p-4 backdrop-blur-md animate-fade-in-up-custom"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-surface shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-shell px-5 py-3.5 sm:px-6 sm:py-4">
          {/* Left: Title & Status Badge */}
          <div className="flex min-w-0 items-center gap-3">
            <h3 className="truncate font-display text-[17px] sm:text-[18px] font-bold leading-tight tracking-tight text-ink max-w-[180px] sm:max-w-xs md:max-w-md">
              {workspace.name}
            </h3>
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
                {t("draftPreview")}
              </span>
            )}
          </div>

          {/* Center: Device Switcher Segmented Control */}
          <div className="flex items-center rounded-full bg-ink/[0.05] p-1 ring-1 ring-black/5">
            {(
              [
                { id: "desktop", label: "Desktop", icon: "desktop_windows" },
                { id: "tablet", label: "Tablet", icon: "tablet_mac" },
                { id: "mobile", label: "Mobile", icon: "smartphone" },
              ] as const
            ).map((item) => {
              const isActive = device === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDevice(item.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
                      : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
                  }`}
                  aria-label={item.label}
                  aria-pressed={isActive}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isPublished && (
              <a
                href={fullSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-surface px-3.5 text-xs font-semibold text-ink shadow-sm transition-all duration-200 hover:border-black/20 hover:bg-black/5 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                {t("visitLiveSite")}
              </a>
            )}

            <Link
              href={`/dashboard/${workspace.id}/editor`}
              className="flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-bold text-white shadow-[0_8px_18px_-6px_rgba(0,207,124,0.5)] transition-all duration-200 hover:bg-accent-deep active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              {t("openEditor")}
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label={t("close")}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Canvas */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F4F5F7] p-4 sm:p-6 md:p-8 flex justify-center items-start">
          <div
            className={`w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              device === "desktop"
                ? "max-w-5xl"
                : device === "tablet"
                ? "max-w-[768px]"
                : "max-w-[390px]"
            }`}
          >
            {workspace.preview ? (
              <div
                className={`overflow-hidden bg-surface transition-all duration-300 ${
                  device === "desktop"
                    ? "rounded-2xl shadow-md ring-1 ring-black/5"
                    : device === "tablet"
                    ? "rounded-[24px] shadow-2xl ring-1 ring-black/10"
                    : "rounded-[32px] shadow-2xl ring-1 ring-black/10"
                }`}
              >
                <PreviewTemplateRenderer
                  templateId={workspace.preview.templateId}
                  data={workspace.preview.data}
                />
              </div>
            ) : (
              <div className="flex h-64 sm:h-96 w-full flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-black/5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink/[0.04] text-ink-faint ring-1 ring-black/5">
                  <span className="material-symbols-outlined text-[28px]">image_not_supported</span>
                </div>
                <p className="max-w-sm text-[13px] font-medium text-ink-soft">
                  {t("previewPlaceholder")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
