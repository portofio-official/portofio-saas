import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSuperuserTestEmail } from "@/lib/auth/superuser";

export type AppRole = "user" | "designer" | "admin";

// Re-exported so the middleware and server code can use the single source of
// truth without importing a client-safe module themselves.
export { SUPERUSER_TEST_EMAIL, isSuperuserTestEmail } from "@/lib/auth/superuser";

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
  // Testing override: treat the hardcoded email as an ordinary authenticated
  // user so the /dashboard gate lets it through. Designer/admin access comes
  // from the requireRole() override below plus the middleware bypass.
  if (isSuperuserTestEmail(user.email)) return 'user';
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
