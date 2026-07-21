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

export async function updateTemplateStatusAction(
  submissionId: string,
  status: "approved" | "rejected" | "revision_requested",
  reviewNotes?: string,
  registryId?: string
) {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  const { data: { user } } = await adminClient.auth.getUser();

  const { error } = await adminClient
    .from("template_submissions")
    .update({
      status,
      review_notes: reviewNotes || null,
      registry_id: registryId || null,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    console.error(`Failed to update template submission ${submissionId}:`, error);
    throw new Error("Failed to update template status");
  }

  revalidatePath("/admin/templates");
}

export async function toggleTemplateVisibilityAction(templateId: string, isActive: boolean) {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("templates")
    .update({ is_active: isActive })
    .eq("id", templateId);

  if (error) {
    console.error(`Failed to toggle visibility for template ${templateId}:`, error);
    throw new Error("Failed to update template visibility");
  }

  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  revalidatePath("/dashboard/templates");
}
