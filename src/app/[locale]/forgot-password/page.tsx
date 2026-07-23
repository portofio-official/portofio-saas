"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordResetAction, type ActionState } from "@/lib/auth/actions";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import styles from "@/components/auth/AuthSplitLayout.module.css";

const initialState: ActionState = { error: null };

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.forgotPassword");
  const tErrors = useTranslations("Auth.errors");
  const tSuccess = useTranslations("Auth.success");
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <AuthSplitLayout
        leftTitle={
          <>
            Lost access?<br />
            <span className="highlight" style={{ color: "var(--accent)", fontWeight: 300, fontStyle: "italic" }}>
              We've got
            </span> you covered.
          </>
        }
        leftSubtitle="Securely reset your password and get back to managing your beautiful portfolio in no time."
        mobileBackHref="/login"
        formTitle={tSuccess("checkYourEmail")}
        formSubtitle={tSuccess("checkYourEmailSubtitle")}
      >
        <div style={{ marginTop: "1rem" }}>
          <Link href="/login" className={styles.btnLogin} style={{ textDecoration: "none", display: "inline-flex" }}>
            Back to log in
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      leftTitle={
        <>
          Lost access?<br />
          <span className="highlight" style={{ color: "var(--accent)", fontWeight: 300, fontStyle: "italic" }}>
            Let's fix
          </span> that.
        </>
      }
      leftSubtitle="Enter your email address and we'll send you a link to get back into your account safely."
      mobileTitle="Recover Account"
      formTitle={
        <Link href="/login" style={{ color: "inherit", display: "flex", alignItems: "center", textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ marginRight: "0.5rem" }}>arrow_back</span>
          Lost access?
        </Link>
      }
      formSubtitle="Enter your email address and we'll send you a recovery link."
    >
      <form action={formAction} className={styles.loginForm}>
        <AuthInput
          label={t("emailLabel")}
          type="email"
          name="email"
          required
          autoComplete="email"
          icon="account_circle"
          placeholder="e.g. name@domain.com"
        />

        {state.error && <p className="text-sm text-danger" style={{ color: "red", fontSize: "0.875rem" }}>{tErrors(state.error)}</p>}

        <AuthSubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
      </form>
    </AuthSplitLayout>
  );
}
