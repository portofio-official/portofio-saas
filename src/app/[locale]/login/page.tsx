"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signInAction, type ActionState } from "@/lib/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = { error: null };

export default function LoginPage() {
  const t = useTranslations("Auth.login");
  const tErrors = useTranslations("Auth.errors");
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <AuthCard
      eyebrow={t("eyebrow")}
      title={t("title")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-medium text-ink hover:underline">
            {t("signUpLink")}
          </Link>
        </>
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
        <FormField
          label={t("passwordLabel")}
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
        <Link
          href="/forgot-password"
          className="self-end text-[13px] text-ink-soft hover:text-ink"
        >
          {t("forgotPasswordLink")}
        </Link>
        {state.error && <p className="text-sm text-danger">{tErrors(state.error)}</p>}
        <SubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
      </form>
    </AuthCard>
  );
}
