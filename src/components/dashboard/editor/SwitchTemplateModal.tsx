"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { saveDraftAction } from "@/lib/projects/actions";
import { getDefinition, PreviewTemplateRenderer as TemplateRenderer, TEMPLATE_CATALOG } from "@/templates/registry";
import { mapDocumentBase } from "@/templates/shared/_base";
import { parseDocumentData } from "@/templates/definition";
import type { TemplateId } from "@/templates/types";
import type { WebsiteDocument } from "@/templates/definition";

export interface SwitchTemplateModalProps {
  projectId: string;
  currentTemplateId: TemplateId;
  currentDocument: WebsiteDocument;
  onClose: () => void;
}

// SP2-020/021/022 — switch an existing project's template. Picking a new
// template maps the shared fields (mapDocumentBase, ladder rung 2: reuses
// the same pattern as mapProfileBase) onto the new template's defaults and
// shows a REAL live preview via the same renderer used everywhere else in
// the app, before anything is saved. Confirming writes the mapped document
// to draft_json via the existing saveDraftAction (same single-upsert path
// every other draft edit already goes through) — published_json is never
// touched here, so the live site stays exactly as it was until the user
// explicitly republishes (same draft/publish separation as editor-007).
//
// Full-bleed layout (not the centered @/components/ui/Modal primitive) to
// match TemplateGallery's existing full-screen preview UX, which this reuses
// PreviewTemplateRenderer from — a live website render needs the whole
// viewport, not a max-w-5xl dialog box. Still implements Modal's core a11y
// contract (ESC-to-close, focus trap, role=dialog, focus restore) inline
// since it can't share that component's centered chrome.
export function SwitchTemplateModal({ projectId, currentTemplateId, currentDocument, onClose }: SwitchTemplateModalProps) {
  const t = useTranslations("Editor.switchTemplate");
  const [candidateId, setCandidateId] = useState<TemplateId | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const candidateDefinition = candidateId ? getDefinition(candidateId) : null;

  // Raw merge only — no local validation. PreviewTemplateRenderer already
  // safeParses against the candidate's schema with a defaults fallback, so
  // validating here too would just redo the exact same check twice.
  const previewData = useMemo(() => {
    if (!candidateDefinition) return null;
    return mapDocumentBase(candidateDefinition.defaults as Record<string, unknown>, currentDocument.data);
  }, [candidateDefinition, currentDocument.data]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (candidateId) setCandidateId(null);
        else onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
    // Re-run on step change (candidateId) so ESC/focus-trap always reflect
    // the current step's exit action and content; open/close itself is
    // owned by the parent unmounting this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  async function handleConfirm() {
    if (!candidateId || !candidateDefinition || !previewData) return;
    setSaving(true);
    setError(null);
    const draftDoc: WebsiteDocument = {
      meta: {
        ...currentDocument.meta,
        templateId: candidateId,
        templateVersion: candidateDefinition.version,
        updatedAt: new Date().toISOString(),
      },
      data: previewData,
    };
    // parseDocumentData (not a bare safeParse) so this also runs any pending
    // migrations for the candidate template and logs a dev-mode warning on a
    // shape mismatch, same as every other read of a WebsiteDocument.
    const validatedData = parseDocumentData(draftDoc, candidateDefinition) as Record<string, unknown>;
    const result = await saveDraftAction(projectId, { ...draftDoc, data: validatedData });
    if (!result.ok) {
      setError(t("saveFailed"));
      setSaving(false);
      return;
    }
    // Editor.tsx derives templateId once from a server-supplied prop; a hard
    // reload is the simplest reliable way to remount it with the new
    // template rather than retrofitting reactive template-switching into
    // that component's large existing state.
    window.location.reload();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md"
      onClick={candidateId ? undefined : onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={candidateId ? t("previewTitle", { name: candidateDefinition?.meta.name ?? "" }) : t("pickTitle")}
        className="flex h-full flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-surface px-4 sm:px-6 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => (candidateId ? setCandidateId(null) : onClose())}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
            >
              <span className="material-symbols-outlined text-[20px]">
                {candidateId ? "arrow_back" : "close"}
              </span>
            </button>
            <span className="truncate font-display text-base font-bold text-ink">
              {candidateId ? t("previewTitle", { name: candidateDefinition?.meta.name ?? "" }) : t("pickTitle")}
            </span>
          </div>
          {candidateId && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-accent-deep active:scale-95 disabled:opacity-60"
            >
              {saving ? t("saving") : t("confirmSwitch")}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-danger/10 px-4 py-2 text-center text-[12px] font-semibold text-danger">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {!candidateId ? (
            <>
              <p className="mx-auto mb-6 max-w-lg text-center text-[13px] text-white/80">{t("pickHint")}</p>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TEMPLATE_CATALOG.map((meta) => {
                  const isCurrent = meta.id === currentTemplateId;
                  return (
                    <button
                      key={meta.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => setCandidateId(meta.id)}
                      className={`rounded-2xl bg-surface p-5 text-left ring-1 transition-all ${
                        isCurrent
                          ? "cursor-default opacity-50 ring-black/10"
                          : "ring-black/5 hover:-translate-y-0.5 hover:ring-accent hover:shadow-lg"
                      }`}
                    >
                      <p className="font-display text-[14px] font-bold text-ink">{meta.name}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] text-ink-soft">{meta.description}</p>
                      {isCurrent && (
                        <span className="mt-2 inline-block rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                          {t("currentBadge")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="preview-frame mx-auto my-2 w-full max-w-[1240px] overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/10">
              {previewData !== null ? <TemplateRenderer templateId={candidateId} data={previewData} /> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
