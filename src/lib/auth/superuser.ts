// Testing-only bypass. Active only in non-production environments.
// In production this always returns false regardless of the email value.
// This account (superuser@test.com / Superuser123! in Supabase Auth) is
// treated as a superuser that can reach all 3 roles (user/designer/admin)
// simultaneously — see getUserRole()/requireRole() (roles.ts) and the
// middleware bypass (proxy.ts). Hardcoded on purpose (Session 115 — reverted
// the Session 114 env-var indirection back to a literal per the user's
// explicit request).
// TODO: delete this account from the Supabase auth.users table before go-live.
const SUPERUSER_TEST_EMAIL = "superuser@test.com";

export function isSuperuserTestEmail(email: string | null | undefined): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return email === SUPERUSER_TEST_EMAIL;
}