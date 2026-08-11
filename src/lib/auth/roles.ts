import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export type AppRole = "user" | "designer" | "admin";

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
  if (!user || !allowedRoles.includes(role)) {
    throw new Error(`Unauthorized: requires one of ${allowedRoles.join(', ')}`);
  }
}
