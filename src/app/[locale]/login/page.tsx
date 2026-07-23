"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signInAction, type ActionState } from "@/lib/auth/actions";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import styles from "@/components/auth/AuthSplitLayout.module.css";

const initialState: ActionState = { error: null };

export default function LoginPage() {
  const t = useTranslations("Auth.login");
  const tErrors = useTranslations("Auth.errors");
  const [state, formAction] = useActionState(signInAction, initialState);

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
      leftSubtitle="Sign in to manage your portfolio, customize your templates, and track your analytics in one unified dashboard."
      mobileTitle="Login"
      formTitle="Welcome to Portofio"
      formSubtitle="Please enter your details to sign in."
      footer={
        <p>
          Don't have an account? <Link href="/signup">Sign up for free</Link>
        </p>
      }
    >
      <form action={formAction} className={styles.loginForm}>
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
          autoComplete="current-password"
          icon="lock"
          placeholder="Enter your password"
          isPassword
        />

        <div className={styles.formOptions}>
          <label className={styles.rememberMe} htmlFor="remember-me">
            <input id="remember-me" name="remember-me" type="checkbox" />
            <span>Remember me</span>
          </label>

          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        {state.error && <p className="text-sm text-danger" style={{ color: "red", fontSize: "0.875rem" }}>{tErrors(state.error)}</p>}

        <AuthSubmitButton label={t("submit")} pendingLabel={t("submitPending")} />

        {/* <button type="button" className={styles.btnGoogle}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
          Sign in with Google
        </button> */}
      </form>
    </AuthSplitLayout>
  );
}
