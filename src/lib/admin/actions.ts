"use server";

import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type AdminUserView = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  createdAt: string;
  isSuspended: boolean;
};

export async function getUsersAction(): Promise<AdminUserView[]> {
  // 1. Verify caller is an admin
  await requireRole(["admin"]);

  // 2. Query all users from Auth schema via Service Role
  const adminClient = createAdminClient();
  const { data: { users }, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    console.error("Failed to list users:", error);
    throw new Error("Failed to fetch users");
  }

  // 3. Map to safe view representation
  return users.map(user => {
    // A user is suspended if ban_duration is set to '87600h' (10 years)
    const isSuspended = !!user.banned_until;

    return {
      id: user.id,
      email: user.email ?? "",
      role: user.app_metadata?.role || "user",
      fullName: user.user_metadata?.full_name || null,
      createdAt: user.created_at,
      isSuspended,
    };
  });
}

export async function toggleUserSuspensionAction(userId: string, suspend: boolean) {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  // We use 87600h (10 years) as an effective permanent ban
  const banDuration = suspend ? "87600h" : "none";

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });

  if (error) {
    console.error(`Failed to toggle suspension for user ${userId}:`, error);
    throw new Error("Failed to update user status");
  }

  revalidatePath("/admin");
}
