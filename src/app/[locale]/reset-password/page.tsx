"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updatePasswordAction, type ActionState } from "@/lib/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = { error: null };

export default function ResetPasswordPage() {
  const t = useTranslations("Auth.resetPassword");
  const tErrors = useTranslations("Auth.errors");
  const [state, formAction] = useActionState(updatePasswordAction, initialState);

  return (
    <AuthCard eyebrow={t("eyebrow")} title={t("title")}>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FormField
            label={t("passwordLabel")}
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span className="text-[13px] text-ink-faint">{t("passwordHint")}</span>
        </div>
        {state.error && <p className="text-sm text-danger">{tErrors(state.error)}</p>}
        <SubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
      </form>
    </AuthCard>
  );
}
