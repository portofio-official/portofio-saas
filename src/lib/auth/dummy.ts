import { cookies } from "next/headers";

// ponytail: cookie-based stand-in for Supabase auth so the UI is demoable
// before a real project exists. No password check, no hashing, no expiry.
// Remove once setup-001 has a real Supabase project — swap callers back to
// `createClient().auth.*` and delete this file.
export const DUMMY_AUTH = process.env.AUTH_DUMMY_MODE === "true";

const COOKIE_NAME = "dummy_session";

export async function setDummySession(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, email, { httpOnly: true, path: "/", sameSite: "lax" });
}

export async function clearDummySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getDummySessionEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}
