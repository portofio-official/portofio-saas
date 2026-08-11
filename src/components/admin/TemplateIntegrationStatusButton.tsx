"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTemplateIntegrationAction } from "@/lib/admin/actions";

type IntegrationStatus = "not_started" | "in_review" | "merged" | "failed";

export function TemplateIntegrationStatusButton({
  submissionId,
  initialStatus,
}: {
  submissionId: string;
  initialStatus: IntegrationStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function update(next: IntegrationStatus) {
    let registryId: string | undefined;
    if (next === "merged") {
      const input = window.prompt("Enter the registry ID after the template is merged:");
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
      className="rounded-lg bg-canvas px-2 py-1.5 text-[11px] font-semibold text-ink-soft ring-1 ring-black/10 outline-none focus:ring-accent disabled:opacity-50"
      aria-label="Template integration status"
    >
      <option value="not_started">Not started</option>
      <option value="in_review">In review</option>
      <option value="merged">Merged</option>
      <option value="failed">Failed</option>
    </select>
  );
}
