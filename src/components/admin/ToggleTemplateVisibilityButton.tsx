"use client";

import { useTransition } from "react";
import { toggleTemplateVisibilityAction } from "@/lib/admin";
import { useTranslations } from "next-intl";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";

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
      type="button"
      onClick={() => {
        startTransition(() => {
          toggleTemplateVisibilityAction(templateId, !isActive);
        });
      }}
      disabled={isPending}
      className={`flex h-11 w-11 items-center justify-center rounded-admin-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary disabled:opacity-50 ${
        isActive
          ? "text-admin-primary-text hover:bg-admin-primary-tint"
          : "text-admin-ink-faint hover:bg-admin-ink/[0.05]"
      }`}
      aria-label={isActive ? t("visibility.hide") : t("visibility.show")}
      title={isActive ? t("visibility.hide") : t("visibility.show")}
    >
      {isActive ? <Eye weight="duotone" size={18} /> : <EyeSlash size={18} />}
    </button>
  );
}
