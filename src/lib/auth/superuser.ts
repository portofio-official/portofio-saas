// This account (superuser@test.com / Superuser123! in Supabase Auth) is
// treated as a superuser that can reach all 3 roles (user/designer/admin)
// simultaneously — see getUserRole()/requireRole() (roles.ts) and the
// middleware bypass (proxy.ts). Hardcoded on purpose (Session 115 — reverted
// the Session 114 env-var indirection back to a literal per the user's
// explicit request).
// Deliberately active in EVERY environment, including production on Vercel
// (Session 115 follow-up — the previous `NODE_ENV === "production"` guard
// disabled the bypass on Vercel, since `next build` always sets
// NODE_ENV=production for both preview and production deployments; the
// user explicitly chose to keep the bypass live there too, after being told
// this means anyone who reads this public repo's source can sign in as a
// full admin on the live site).
// TODO: delete this account from the Supabase auth.users table before go-live.
const SUPERUSER_TEST_EMAIL = "superuser@test.com";

export function isSuperuserTestEmail(email: string | null | undefined): boolean {
  return email === SUPERUSER_TEST_EMAIL;
}