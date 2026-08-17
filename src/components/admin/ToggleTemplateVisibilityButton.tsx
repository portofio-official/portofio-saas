"use client";

import { useTransition } from "react";
import { toggleTemplateVisibilityAction } from "@/lib/admin";
import { useTranslations } from "next-intl";

export function ToggleTemplateVisibilityButton({
  templateId,
  isActive,
}: {
  templateId: string;
  isActive: boolean;
}) {
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(() => {
          toggleTemplateVisibilityAction(templateId, !isActive);
        });
      }}
      disabled={isPending}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
        isActive
          ? "text-positive hover:bg-positive/10 active:bg-positive/10"
          : "text-ink-faint hover:bg-ink/[0.05] active:bg-ink/[0.08]"
      }`}
      aria-label={isActive ? t("visibility.hide") : t("visibility.show")}
      title={isActive ? t("visibility.hide") : t("visibility.show")}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isActive ? "visibility" : "visibility_off"}
      </span>
    </button>
  );
}
