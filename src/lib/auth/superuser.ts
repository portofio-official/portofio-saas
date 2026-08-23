// Testing-only bypass. Active only in non-production environments.
// In production this always returns false regardless of the email value.
// Email comes from NEXT_PUBLIC_SUPERUSER_TEST_EMAIL (not a server-only var —
// this file is also imported by the client-side Navbar) so the account isn't
// hardcoded in source. Falls back to the same default used since Session 099.
// TODO: delete this account from the Supabase auth.users table before go-live.
const SUPERUSER_TEST_EMAIL =
  process.env.NEXT_PUBLIC_SUPERUSER_TEST_EMAIL || "superuser@test.com";

export function isSuperuserTestEmail(email: string | null | undefined): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return email === SUPERUSER_TEST_EMAIL;
}