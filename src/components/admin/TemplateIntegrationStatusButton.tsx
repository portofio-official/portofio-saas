"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTemplateIntegrationAction } from "@/lib/admin";
import { useTranslations } from "next-intl";

type IntegrationStatus = "not_started" | "in_review" | "merged" | "failed";

export function TemplateIntegrationStatusButton({
  submissionId,
  initialStatus,
}: {
  submissionId: string;
  initialStatus: IntegrationStatus;
}) {
  const t = useTranslations("Admin");
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [pendingMerge, setPendingMerge] = useState<string | null>(null); // null = not pending, "" = modal open
  const router = useRouter();

  function onChange(next: IntegrationStatus) {
    if (next === "merged") {
      setPendingMerge(""); // open inline modal
      return;
    }
    commit(next);
  }

  function commit(next: IntegrationStatus, registryId?: string) {
    startTransition(async () => {
      try {
        await updateTemplateIntegrationAction(submissionId, next, undefined, registryId);
        setStatus(next);
        setPendingMerge(null);
        router.refresh();
      } catch {
        setStatus(initialStatus);
        setPendingMerge(null);
      }
    });
  }

  return (
    <>
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value as IntegrationStatus)}
        className="rounded-lg bg-shell px-2.5 py-2 text-[11px] font-semibold text-ink-soft ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-accent disabled:opacity-50"
        aria-label={t("integration.label")}
      >
        <option value="not_started">{t("integration.notStarted")}</option>
        <option value="in_review">{t("integration.inReview")}</option>
        <option value="merged">{t("integration.merged")}</option>
        <option value="failed">{t("integration.failed")}</option>
      </select>

      {/* Inline registry-ID modal — replaces window.prompt */}
      {pendingMerge !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xs rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-black/10">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">
              {t("integration.merged")}
            </h3>
            <label className="mb-1.5 block text-[12px] font-medium text-ink-soft">
              {t("integration.mergedHint")}
            </label>
            <input
              autoFocus
              type="text"
              value={pendingMerge}
              onChange={(e) => setPendingMerge(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pendingMerge.trim()) commit("merged", pendingMerge.trim());
                if (e.key === "Escape") setPendingMerge(null);
              }}
              className="mb-4 w-full rounded-lg border border-black/10 bg-shell px-3 py-2 text-[13px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="e.g. template-studio-v1"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingMerge(null)}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-ink/[0.04] transition"
              >
                Batal
              </button>
              <button
                onClick={() => pendingMerge.trim() && commit("merged", pendingMerge.trim())}
                disabled={!pendingMerge.trim() || isPending}
                className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-deep disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
