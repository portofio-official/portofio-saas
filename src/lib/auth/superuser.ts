// Testing-only bypass. Active only in non-production environments.
// In production this always returns false regardless of the email value.
// TODO: delete superuser@test.com from the Supabase auth.users table before go-live.
const SUPERUSER_TEST_EMAIL = "superuser@test.com";

export function isSuperuserTestEmail(email: string | null | undefined): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return email === SUPERUSER_TEST_EMAIL;
}