"use client";

import { useActionState, use, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signUpAction, type ActionState, checkPasswordStrength } from "@/lib/auth";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { TemplateCookieSetter } from "@/components/auth/TemplateCookieSetter";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import styles from "@/components/auth/AuthSplitLayout.module.css";

const initialState: ActionState = { error: null };

export default function SignupPage({ searchParams }: { searchParams: Promise<{ templateId?: string }> }) {
  const { templateId } = use(searchParams);
  const t = useTranslations("Auth.signup");
  const tErrors = useTranslations("Auth.errors");
  const tRules = useTranslations("Auth.rules");
  const tSuccess = useTranslations("Auth.success");
  const [state, formAction] = useActionState(signUpAction, initialState);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<null | "strength" | "mismatch">(null);

  const strength = useMemo(() => checkPasswordStrength(password), [password]);
  const ruleKeys = [
    { key: "minLength", passed: strength.passed.includes("minLength") },
    { key: "lowercase", passed: strength.passed.includes("lowercase") },
    { key: "uppercase", passed: strength.passed.includes("uppercase") },
    { key: "number", passed: strength.passed.includes("number") },
    { key: "special", passed: strength.passed.includes("special") },
  ] as const;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!strength.valid || confirmPassword !== password) {
      e.preventDefault();
      setClientError(!strength.valid ? "strength" : "mismatch");
      return;
    }
    setClientError(null);
  };

  if (state.success) {
    return (
      <AuthSplitLayout
        leftTitle={
          <>
            Your Work,<br />
            <span className="highlight" style={{ color: "var(--accent)", fontWeight: 300, fontStyle: "italic" }}>
              Beautifully
            </span> Showcased.
          </>
        }
        leftSubtitle="Join thousands of professionals showcasing their work gracefully."
        formTitle={tSuccess("checkYourEmail")}
        formSubtitle={tSuccess("checkYourEmailSubtitle")}
        showMobileBack={false}
      >
        <div style={{ marginTop: "1rem" }}>
          <Link href="/login" className={styles.btnLogin} style={{ textDecoration: "none", display: "inline-flex" }}>
            Return to Login
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      leftTitle={
        <>
          {t("leftTitleJoin")} <br />
          <span className="highlight" style={{ color: "var(--accent)", fontWeight: 300, fontStyle: "italic" }}>
            {t("leftTitleCreative")}
          </span>
          <br />
          {t("leftTitleCommunity")}
        </>
      }
      leftSubtitle={t("leftSubtitle")}
      mobileTitle="Sign Up"
      formTitle={t("formTitle")}
      formSubtitle={t("formSubtitle")}
      footer={
        <p>
          {t("footerText")} <Link href="/login">{t("footerLink")}</Link>
        </p>
      }
    >
      <form action={formAction} onSubmit={handleSubmit} className={styles.loginForm}>

        <AuthInput
          label={t("emailLabel")}
          type="email"
          name="email"
          required
          autoComplete="email"
          icon="mail"
          placeholder="Enter your email"
        />

        <div>
          <AuthInput
            label={
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                {t("passwordLabel")}
                <div className={styles.passwordTooltipContainer}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "var(--text-secondary)", cursor: "help" }}>info</span>
                  <div className={styles.passwordTooltipContent}>
                    <div className={styles.passwordRules} role="group" aria-label="Password requirements">
                      {ruleKeys.map(({ key, passed }) => (
                        <div key={key} className={`${styles.passwordRule} ${passed ? styles.passed : ""}`}>
                          <span className={`${styles.ruleIcon} material-symbols-outlined`} aria-hidden style={{ color: passed ? "var(--accent)" : "var(--text-secondary)" }}>
                            {passed ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          {tRules(key)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            icon="lock"
            placeholder={t("passwordPlaceholder")}
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <AuthInput
          label={t("confirmPasswordLabel")}
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          icon="lock"
          placeholder={t("confirmPasswordPlaceholder")}
          isPassword
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {(state.error || clientError) && (
          <p className="text-sm text-danger" style={{ color: "red", fontSize: "0.875rem" }}>
            {clientError ? tErrors(clientError) : tErrors(state.error!)}
          </p>
        )}

        <AuthSubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
      </form>

      <GoogleSignInButton templateId={templateId} />
      {templateId && <TemplateCookieSetter templateId={templateId} />}
    </AuthSplitLayout>
  );
}
