"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
export type ActionState = { error: string | null; success?: string | null };

async function origin() {
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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { error: "weakPassword" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await origin()}/auth/confirm?next=${encodeURIComponent("/login?confirmed=1")}`,
    },
  });

  if (error) return { error: mapAuthError(error.message) };
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

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/confirm?next=/reset-password`,
  });

  if (error) return { error: mapAuthError(error.message) };
  return { error: null, success: "checkYourEmail" };
}

export async function updatePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "weakPassword" };
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
