"use client";

import { useState, useTransition } from "react";
import { createTemplateSourceDownloadUrlAction } from "@/lib/admin";
import { useTranslations } from "next-intl";

export function TemplateSourceDownloadButton({
  submissionId,
  filename,
}: {
  submissionId: string;
  filename: string | null;
}) {
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function download() {
    setError(false);
    startTransition(async () => {
      const result = await createTemplateSourceDownloadUrlAction(submissionId);
      if (result.ok && result.url) {
        window.location.assign(result.url);
      } else {
        setError(true);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={download}
        disabled={isPending || !filename}
        className="inline-flex items-center gap-1.5 rounded-full bg-shell px-3 py-1.5 text-[11px] font-semibold text-ink-soft ring-1 ring-black/10 transition-colors hover:bg-ink/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[15px]">download</span>
        {isPending ? t("source.downloading") : filename ? t("source.download") : t("source.noSource")}
      </button>
      {error && <span className="text-[10px] font-medium text-danger">{t("source.failed")}</span>}
    </div>
  );
}