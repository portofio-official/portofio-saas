import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  const role = await getUserRole();
  if (!allowedRoles.includes(role)) {
    throw new Error(`Unauthorized: requires one of ${allowedRoles.join(', ')}`);
  }
}
