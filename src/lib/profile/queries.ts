import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "./types";

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    socials: data.socials ?? [],
    skills: data.skills ?? [],
  } as UserProfile;
}
