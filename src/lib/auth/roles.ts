import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export type AppRole = "user" | "designer" | "admin";

// Testing-only hardcoded email that bypasses role checks and is granted every
// role ("user", "designer", "admin"). Intended for local/staging development.
// Remove or change this value before production launch.
export const SUPERUSER_TEST_EMAIL = "superuser@test.com";

export function isSuperuserTestEmail(email: string | null | undefined): boolean {
  return email === SUPERUSER_TEST_EMAIL;
}

export async function getUserRole(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'user'; // default fallback
  // Testing override: grant the highest role so the email can reach every area.
  if (isSuperuserTestEmail(user.email)) return 'admin';
  return user.app_metadata?.role || 'user';
}

export async function requireRole(allowedRoles: string[]): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role || "user";

  // Never treat an anonymous request as the default user role. The default is
  // only for an authenticated account whose claim has not been populated yet.
  if (!user) {
    throw new Error(`Unauthorized: requires one of ${allowedRoles.join(', ')}`);
  }

  // Testing override: the hardcoded email passes any role check.
  if (isSuperuserTestEmail(user.email)) return;

  if (!allowedRoles.includes(role)) {
    throw new Error(`Unauthorized: requires one of ${allowedRoles.join(', ')}`);
  }
}
