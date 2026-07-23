"use client";

import { useActionState, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signUpAction, type ActionState } from "@/lib/auth/actions";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { TemplateCookieSetter } from "@/components/auth/TemplateCookieSetter";
import styles from "@/components/auth/AuthSplitLayout.module.css";

const initialState: ActionState = { error: null };

export default function SignupPage({ searchParams }: { searchParams: Promise<{ templateId?: string }> }) {
  const { templateId } = use(searchParams);
  const t = useTranslations("Auth.signup");
  const tErrors = useTranslations("Auth.errors");
  const tSuccess = useTranslations("Auth.success");
  const [state, formAction] = useActionState(signUpAction, initialState);

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
          Join Our,<br />
          <span className="highlight" style={{ color: "var(--accent)", fontWeight: 300, fontStyle: "italic" }}>
            Creative
          </span> Community.
        </>
      }
      leftSubtitle="Sign up to start building your portfolio, customizing templates, and reaching a wider audience today."
      mobileTitle="Sign Up"
      formTitle="Create an Account"
      formSubtitle="Please fill in the details below to create your account."
      footer={
        <p>
          Already have an account? <Link href="/login">Sign in here</Link>
        </p>
      }
    >
      <form action={formAction} className={styles.loginForm}>
        <div className={styles.nameRow}>
          <AuthInput
            label="First Name"
            name="firstName"
            placeholder="First Name"
            icon="person"
          />
          <AuthInput
            label="Last Name"
            name="lastName"
            placeholder="Last Name"
          />
        </div>

        <AuthInput
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="e.g. 6281234567890"
          pattern="^62[0-9]{8,15}$"
          title="Phone number must start with '62' without the '+' sign (e.g. 6281234567890)"
          icon="call"
        />

        <AuthInput
          label={t("emailLabel")}
          type="email"
          name="email"
          required
          autoComplete="email"
          icon="mail"
          placeholder="Enter your email"
        />

        <AuthInput
          label={t("passwordLabel")}
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          icon="lock"
          placeholder="Enter your password"
          isPassword
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          icon="lock"
          placeholder="Confirm your password"
          isPassword
        />

        {state.error && <p className="text-sm text-danger" style={{ color: "red", fontSize: "0.875rem" }}>{tErrors(state.error)}</p>}

        <AuthSubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
      </form>
      {templateId && <TemplateCookieSetter templateId={templateId} />}
    </AuthSplitLayout>
  );
}
