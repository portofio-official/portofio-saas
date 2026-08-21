"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTemplateStatusAction } from "@/lib/admin";
import { useTranslations } from "next-intl";

type ReviewAction = "approved" | "rejected" | "revision_requested";

interface ModalState {
  action: ReviewAction;
  notes: string;
  registryId: string;
  error: string;
}

interface Props {
  submissionId: string;
}

export function ReviewTemplateDropdown({ submissionId }: Props) {
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setModal(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openModal = (action: ReviewAction) => {
    setIsOpen(false);
    setModal({ action, notes: "", registryId: "", error: "" });
  };

  const submitModal = () => {
    if (!modal) return;
    const { action, notes, registryId } = modal;

    if ((action === "rejected" || action === "revision_requested") && !notes.trim()) {
      setModal({ ...modal, error: t("review.rejectionRequired") });
      return;
    }

    startTransition(async () => {
      try {
        await updateTemplateStatusAction(
          submissionId,
          action,
          notes.trim(),
          action === "approved" ? registryId.trim() : undefined,
        );
        setModal(null);
        router.refresh();
      } catch (err) {
        setModal({
          ...modal,
          error: err instanceof Error ? err.message : t("review.errorGeneric"),
        });
      }
    });
  };

  const actionLabel: Record<ReviewAction, string> = {
    approved: t("review.approve"),
    rejected: t("review.reject"),
    revision_requested: t("review.revision"),
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-ink/[0.05] px-3.5 py-2 text-[12px] font-semibold text-ink ring-1 ring-black/5 transition-colors hover:bg-ink/[0.08] disabled:opacity-50"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <span>{isPending ? t("review.updating") : t("review.trigger")}</span>
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>

        {isOpen && !isPending && (
          <div
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-surface p-1 shadow-floating ring-1 ring-black/5 focus:outline-none animate-fade-in-up-custom"
            role="menu"
          >
            <button
              onClick={() => openModal("approved")}
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-ink hover:bg-ink/[0.04] active:bg-ink/[0.06]"
            >
              {t("review.approve")}
            </button>
            <button
              onClick={() => openModal("revision_requested")}
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-ink hover:bg-ink/[0.04] active:bg-ink/[0.06]"
            >
              {t("review.revision")}
            </button>
            <button
              onClick={() => openModal("rejected")}
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-danger hover:bg-danger/10 active:bg-danger/[0.12]"
            >
              {t("review.reject")}
            </button>
          </div>
        )}
      </div>

      {/* Inline review modal — replaces window.prompt */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-black/10">
            <h3 className="mb-4 text-[15px] font-semibold text-ink">
              {actionLabel[modal.action]}
            </h3>

            {modal.action === "approved" && (
              <div className="mb-3">
                <label className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                  {t("review.registrationHint")}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={modal.registryId}
                  onChange={(e) => setModal({ ...modal, registryId: e.target.value })}
                  className="w-full rounded-lg border border-black/10 bg-shell px-3 py-2 text-[13px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="e.g. template-minimal-v2"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                {modal.action === "approved" ? t("review.approvalHint") : t("review.rejectionHint")}
              </label>
              <textarea
                autoFocus={modal.action !== "approved"}
                value={modal.notes}
                onChange={(e) => setModal({ ...modal, notes: e.target.value, error: "" })}
                rows={3}
                className="w-full rounded-lg border border-black/10 bg-shell px-3 py-2 text-[13px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                placeholder={
                  modal.action === "approved" ? t("review.approvalHint") : t("review.rejectionHint")
                }
              />
            </div>

            {modal.error && (
              <p className="mb-3 text-[12px] text-danger">{modal.error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-ink/[0.04] transition"
              >
                Batal
              </button>
              <button
                onClick={submitModal}
                disabled={isPending}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition disabled:opacity-50 ${
                  modal.action === "rejected"
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-accent hover:bg-accent-deep"
                }`}
              >
                {isPending ? t("review.updating") : t("common.confirm", { defaultValue: "Konfirmasi" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
