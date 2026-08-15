"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkPasswordStrength } from "@/lib/auth/password";
export type ActionState = { error: string | null; success?: string | null };

async function getClientIp(): Promise<string> {
  const h = await headers();
  // x-vercel-forwarded-for is set by the Vercel edge and is the trusted client
  // IP. The raw x-forwarded-for can be spoofed by a client sending its own
  // header, so it is only a last-resort fallback.
  return (
    h.get("x-vercel-forwarded-for")?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-ip"
  );
}

async function getAppUrl() {
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    return domain.includes("localhost") ? `http://${domain}` : `https://${domain}`;
  }
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${h.get("host")}`;
}

function mapAuthError(message: string): string {
  if (message.includes("already registered")) return "userExists";
  if (message.includes("Invalid login credentials")) return "invalidCredentials";
  if (message.includes("Password should be at least")) return "weakPassword";
  if (message.includes("Email not confirmed")) return "emailNotConfirmed";
  if (message.includes("rate limit")) return "rateLimited";
  return "generic";
}

export async function signUpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const rate = await checkRateLimit(`signup:${ip}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) {
    return { error: "rateLimited" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email) {
    return { error: "invalidCredentials" };
  }
  const passwordStrength = checkPasswordStrength(password);
  if (!passwordStrength.valid) {
    return { error: "passwordStrength" };
  }
  if (confirmPassword && password !== confirmPassword) {
    return { error: "passwordMismatch" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await getAppUrl()}/auth/confirm?next=${encodeURIComponent("/login?confirmed=1")}`,
    },
  });

  if (error) return { error: mapAuthError(error.message) };

  // When the email already belongs to a (confirmed) account, Supabase returns
  // `user: null` with no error and deliberately does not send an email — the
  // app previously showed "Check your email" forever. Detect it: a brand-new
  // signup always has at least one identity; an existing user has none.
  const hasIdentity = (data.user?.identities?.length ?? 0) > 0;
  if (!data.user || !hasIdentity) {
    return { error: "userExists" };
  }

  return { error: null, success: "checkYourEmail" };
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "invalidCredentials" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: mapAuthError(error.message) };
  return redirect({ href: "/dashboard", locale: await getLocale() });
}

export type GoogleOAuthState = { error: string | null; url: string | null };

/**
 * Initiates Google OAuth. Returns the Supabase-generated Google consent URL
 * (the server sets the PKCE state cookie, the browser then navigates to the
 * URL and comes back through /auth/callback with a `code` to exchange).
 */
export async function googleSignInAction(templateId?: string): Promise<GoogleOAuthState> {
  const ip = await getClientIp();
  const rate = await checkRateLimit(`oauth:${ip}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) {
    return { error: "rateLimited", url: null };
  }

  const redirectTo = new URL(`/auth/callback`, await getAppUrl());
  redirectTo.searchParams.set("redirect", "/dashboard");
  if (templateId) redirectTo.searchParams.set("templateId", templateId);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectTo.toString() },
  });

  if (error || !data.url) {
    return { error: error ? mapAuthError(error.message) : "generic", url: null };
  }
  return { error: null, url: data.url };
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const rate = await checkRateLimit(`reset:${ip}`, 3, 15 * 60 * 1000);
  if (!rate.allowed) {
    return { error: "rateLimited" };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "invalidCredentials" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getAppUrl()}/auth/confirm?next=/reset-password`,
  });

  if (error) return { error: mapAuthError(error.message) };
  return { error: null, success: "checkYourEmail" };
}

export async function updatePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");

  if (!checkPasswordStrength(password).valid) {
    return { error: "passwordStrength" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: mapAuthError(error.message) };
  return redirect({ href: "/login", locale: await getLocale() });
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect({ href: "/login", locale: await getLocale() });
}
