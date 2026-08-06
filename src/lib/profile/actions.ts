"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: {
  full_name?: string;
  avatar_url?: string;
  locale?: 'en' | 'id';
  phone?: string;
  address?: string;
  nickname?: string;
  headline?: string;
  bio?: string;
  contact_email?: string;
  socials?: Array<{ platform: string; url: string }>;
  skills?: Array<{ name: string; proficiency?: number }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const updates: Record<string, unknown> = {};
  if (data.full_name !== undefined) updates.full_name = data.full_name;
  if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url;
  if (data.locale !== undefined) updates.locale = data.locale;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.address !== undefined) updates.address = data.address;
  if (data.nickname !== undefined) updates.nickname = data.nickname;
  if (data.headline !== undefined) updates.headline = data.headline;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.contact_email !== undefined) updates.contact_email = data.contact_email;
  if (data.socials !== undefined) updates.socials = data.socials;
  if (data.skills !== undefined) updates.skills = data.skills;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update profile", error);
    return { error: "Failed to update profile" };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { success: true };
}
