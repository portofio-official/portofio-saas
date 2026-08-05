"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: { full_name?: string; avatar_url?: string; locale?: 'en' | 'id' }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const updates: { full_name?: string; avatar_url?: string; locale?: 'en' | 'id' } = {};
  if (data.full_name !== undefined) updates.full_name = data.full_name;
  if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url;
  if (data.locale !== undefined) updates.locale = data.locale;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update profile", error);
    return { error: "Failed to update profile" };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { success: true };
}
