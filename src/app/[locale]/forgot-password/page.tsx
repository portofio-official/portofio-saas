"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordResetAction, type ActionState } from "@/lib/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = { error: null };

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.forgotPassword");
  const tErrors = useTranslations("Auth.errors");
  const tSuccess = useTranslations("Auth.success");
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <AuthCard eyebrow={t("eyebrow")} title={tSuccess("checkYourEmail")}>
        <p className="text-[15px] leading-6 text-ink-soft">
          {tSuccess("checkYourEmailSubtitle")}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <Link href="/login" className="font-medium text-ink hover:underline">
          {t("backToLogin")}
        </Link>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <FormField
          label={t("emailLabel")}
          type="email"
          name="email"
          required
          autoComplete="email"
        />
        {state.error && <p className="text-sm text-danger">{tErrors(state.error)}</p>}
        <SubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
      </form>
    </AuthCard>
  );
}
