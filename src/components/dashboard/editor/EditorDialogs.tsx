"use client";

import { useTranslations } from "next-intl";
import { PreviewTemplateRenderer as TemplateRenderer } from "@/templates/registry";
import type { TemplateId } from "@/templates/types";
import type { EditorData, ReadinessIssue, VersionListItem } from "./types";

export interface EditorDialogsProps {
  locale: string;
  domain: string;
  templateId: TemplateId;
  data: EditorData;

  // Desktop preview
  showDesktopPreview: boolean;
  onCloseDesktopPreview: () => void;

  // Version history
  showVersionHistory: boolean;
  versionHistory: VersionListItem[];
  versionHistoryLoading: boolean;
  restoringVersionId: string | null;
  onCloseVersionHistory: () => void;
  onRestoreVersion: (versionId: string) => void;

  // Publish readiness modal
  showPublishModal: boolean;
  publishErrors: ReadinessIssue[];
  onClosePublishModal: () => void;
  onGoToIssue: (issue: ReadinessIssue) => void;

  // Revert to live dialog
  showRevertDialog: boolean;
  revertLoading: boolean;
  onCloseRevertDialog: () => void;
  onRevert: () => void;

  // Publish dialog
  showPublishDialog: boolean;
  publishStatus: "draft" | "published";
  subdomain: string;
  siteUrl: string;
  publishError: string | null;
  publishLoading: boolean;
  onSubdomainChange: (value: string) => void;
  onClosePublishDialog: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function EditorDialogs(props: EditorDialogsProps) {
  const t = useTranslations("Editor");
  const {
    locale,
    domain,
    templateId,
    data,
    showDesktopPreview,
    onCloseDesktopPreview,
    showVersionHistory,
    versionHistory,
    versionHistoryLoading,
    restoringVersionId,
    onCloseVersionHistory,
    onRestoreVersion,
    showPublishModal,
    publishErrors,
    onClosePublishModal,
    onGoToIssue,
    showRevertDialog,
    revertLoading,
    onCloseRevertDialog,
    onRevert,
    showPublishDialog,
    publishStatus,
    subdomain,
    siteUrl,
    publishError,
    publishLoading,
    onSubdomainChange,
    onClosePublishDialog,
    onPublish,
    onUnpublish,
  } = props;

  return (
    <>
      {/* Fullscreen Desktop Preview Modal */}
      {showDesktopPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 shadow-sm">
            <span className="font-display text-lg font-bold text-ink">{t("desktopPreview")}</span>
            <button type="button"
              onClick={onCloseDesktopPreview}
              className="group flex items-center gap-2 rounded-full bg-black/5 px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:bg-black/10 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90 group-hover:text-danger">
                close
              </span>{" "}
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-canvas p-8">
            <div className="preview-frame mx-auto w-full max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-black/5">
              <TemplateRenderer templateId={templateId} data={data as never} />
            </div>
          </div>
        </div>
      )}

      {/* Version history */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-floating ring-1 ring-black/5">
            <div className="flex items-start justify-between border-b border-black/5 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-ink">{t("versionHistory")}</h3>
                <p className="mt-1 text-sm text-ink-soft">Restore an earlier autosave without changing the live website.</p>
              </div>
              <button
                type="button"
                onClick={onCloseVersionHistory}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
                aria-label={t("closeVersionHistory")}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="max-h-[min(28rem,65vh)] overflow-y-auto p-4">
              {versionHistoryLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-ink-soft">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
                  {t("loadingVersions")}
                </div>
              ) : versionHistory.length === 0 ? (
                <div className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-soft">
                  {t("noSavedVersions")}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {versionHistory.map((version, index) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-canvas px-4 py-3 ring-1 ring-black/5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`material-symbols-outlined shrink-0 text-[18px] ${index === 0 ? "text-accent" : "text-ink-faint"}`}>
                          {index === 0 ? "schedule" : "history"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            Version {version.versionNumber}{index === 0 ? " · Latest" : ""}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.createdAt))}
                            {version.isAutosave ? " · Autosave" : " · Initial draft"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={restoringVersionId !== null || index === 0}
                        onClick={() => onRestoreVersion(version.id)}
                        className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-black/10 transition-colors hover:bg-accent hover:text-white hover:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {restoringVersionId === version.id ? "Restoring..." : index === 0 ? "Current" : "Restore"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-black/5 px-6 py-4 text-xs text-ink-soft">
              Restoring creates a new draft version. Your published website stays unchanged until you publish again.
            </div>
          </div>
        </div>
      )}

      {/* Publish Readiness Modal (missing required data) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">{t("publishNotReady")}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                   Complete the following items before publishing your website. Select an item to jump to its editor section.
                </p>
              </div>
              <button type="button" onClick={onClosePublishModal} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {publishErrors.map((issue) => (
                <li key={`${issue.id}-${issue.label}`}>
                  <button
                    type="button"
                    onClick={() => onGoToIssue(issue)}
                    className="flex w-full items-start gap-2.5 rounded-xl bg-warning-soft px-3.5 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-warning/10"
                  >
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-warning">error_outline</span>
                    <span>
                      <span className="block">{issue.label}</span>
                      <span className="mt-0.5 block text-xs font-normal text-ink-soft">{issue.detail}</span>
                    </span>
                    <span className="material-symbols-outlined ml-auto mt-0.5 text-[16px]">arrow_forward</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onClosePublishModal}
              className="mt-5 w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
            >
              {t("continueEditing")}
            </button>
          </div>
        </div>
      )}

      {/* Revert to live confirm dialog (B-4) */}
      {showRevertDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">{t("revertToLiveTitle")}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Semua perubahan draft yang belum dipublikasikan akan diganti dengan versi yang saat ini live. Aksi ini tidak bisa dibatalkan.
                </p>
              </div>
              <button type="button" onClick={onCloseRevertDialog} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCloseRevertDialog}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={revertLoading}
                onClick={onRevert}
                className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-deep disabled:opacity-60"
              >
                {revertLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Mengembalikan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">undo</span>
                    Kembalikan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Dialog (subdomain + gate) */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating ring-1 ring-black/5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {publishStatus === "published" ? "Website Live" : "Publish Website"}
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Choose a unique subdomain to publish this portfolio to.
                </p>
              </div>
              <button
                type="button"
                onClick={onClosePublishDialog}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Success state when already published */}
            {publishStatus === "published" && (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-positive/10 px-3.5 py-3 text-sm font-semibold text-positive">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {subdomain && (
                  <a href={`${siteUrl}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
                    {`${siteUrl}`}
                  </a>
                )}
              </div>
            )}

            {/* Subdomain input */}
            <label className="mb-1.5 block text-[12px] font-bold text-ink-soft uppercase tracking-[0.05em]">
              {t("subdomain")}
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-accent">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => onSubdomainChange(e.target.value)}
                placeholder="namamu"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              {t("previewLabel")} <span className="font-medium text-ink-soft">{`${domain}/sites/${subdomain || "namamu"}`}</span>
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {t("publishDialogHint")}
            </p>

            {/* Error display */}
            {publishError && publishError !== "subscription_required" && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600">
                <span className="material-symbols-outlined text-[18px]">error_outline</span>
                {publishError}
              </div>
            )}

            {/* Subscription gate CTA */}
            {publishError === "subscription_required" && (
              <div className="mt-4 rounded-xl bg-accent/[0.06] px-4 py-4 ring-1 ring-accent/20">
                <p className="text-sm font-semibold text-ink">
                  Berlangganan untuk publish website kamu.
                </p>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  Rp 49.000/bulan - satu paket, tanpa tier. Publish, update, unpublish bebas selama aktif.
                </p>
                <a
                  href={`/${locale}/dashboard/billing`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
                >
                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                  Berlangganan Sekarang
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center gap-3">
              {publishStatus === "published" && subdomain && (
                <button
                  type="button"
                  disabled={publishLoading}
                  onClick={onUnpublish}
                  className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/10 transition-colors hover:bg-black/5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_off</span>
                  Unpublish
                </button>
              )}
              <button
                type="button"
                disabled={publishLoading || !subdomain.trim()}
                onClick={onPublish}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-deep hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    {publishStatus === "published" ? "Republish" : "Publish"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
