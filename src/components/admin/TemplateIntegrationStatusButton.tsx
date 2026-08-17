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
  const router = useRouter();

  function update(next: IntegrationStatus) {
    let registryId: string | undefined;
    if (next === "merged") {
      const input = window.prompt(t("integration.mergedHint"));
      if (input === null || !input.trim()) return;
      registryId = input.trim();
    }

    startTransition(async () => {
      try {
        await updateTemplateIntegrationAction(submissionId, next, undefined, registryId);
        setStatus(next);
        router.refresh();
      } catch {
        setStatus(initialStatus);
      }
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(event) => update(event.target.value as IntegrationStatus)}
      className="rounded-lg bg-shell px-2 py-1.5 text-[11px] font-semibold text-ink-soft ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-accent disabled:opacity-50"
      aria-label={t("integration.label")}
    >
      <option value="not_started">{t("integration.notStarted")}</option>
      <option value="in_review">{t("integration.inReview")}</option>
      <option value="merged">{t("integration.merged")}</option>
      <option value="failed">{t("integration.failed")}</option>
    </select>
  );
}