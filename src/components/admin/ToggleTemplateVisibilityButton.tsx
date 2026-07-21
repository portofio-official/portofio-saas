"use client";

import { useTransition } from "react";
import { toggleTemplateVisibilityAction } from "@/lib/admin/actions";

export function ToggleTemplateVisibilityButton({
  templateId,
  isActive,
}: {
  templateId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(() => {
          toggleTemplateVisibilityAction(templateId, !isActive);
        });
      }}
      disabled={isPending}
      className={`flex items-center justify-center rounded-full p-2 transition-colors ${
        isActive
          ? "text-positive hover:bg-positive/10"
          : "text-ink-faint hover:bg-black/5"
      }`}
      aria-label={isActive ? "Hide Template" : "Show Template"}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isActive ? "visibility" : "visibility_off"}
      </span>
    </button>
  );
}
