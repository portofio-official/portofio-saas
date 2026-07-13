import { createClient } from "@/lib/supabase/server";
import { DUMMY_AUTH, getDummySessionEmail } from "@/lib/auth/dummy";

export async function getCurrentUserEmail(): Promise<string | null> {
  if (DUMMY_AUTH) {
    return getDummySessionEmail();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}
