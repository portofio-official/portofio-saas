// Testing-only hardcoded email that bypasses role checks and is granted every
// role ("user", "designer", "admin"). Intended for local/staging development.
// Remove or change this value before production launch.
export const SUPERUSER_TEST_EMAIL = "superuser@test.com";

export function isSuperuserTestEmail(email: string | null | undefined): boolean {
  return email === SUPERUSER_TEST_EMAIL;
}