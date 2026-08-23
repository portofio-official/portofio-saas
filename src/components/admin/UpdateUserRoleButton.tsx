"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateUserRoleAction } from "@/lib/admin";
import type { AppRole } from "@/lib/auth/roles";
import { useTranslations } from "next-intl";

export function UpdateUserRoleButton({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  const t = useTranslations("Admin");
  const [value, setValue] = useState<AppRole>(role as AppRole);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function change(nextRole: AppRole) {
    const previous = value;
    setValue(nextRole);
    setError(null);
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, nextRole);
      if (!result.ok) {
        setValue(previous);
        setError(result.error ?? t("role.updateFailed"));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        value={value}
        disabled={isPending}
        onChange={(event) => change(event.target.value as AppRole)}
        aria-label={t("role.label")}
        className="h-9 rounded-admin-sm border border-admin-border px-3 text-[12px] font-semibold capitalize text-admin-ink-soft outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary disabled:opacity-50"
      >
        <option value="user">{t("role.user")}</option>
        <option value="designer">{t("role.designer")}</option>
        <option value="admin">{t("role.admin")}</option>
      </select>
      {error && <span className="max-w-[150px] text-[10px] font-medium text-admin-rose">{error}</span>}
    </div>
  );
}
