"use server";

import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  const { data: { users }, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    console.error("Failed to list users:", error);
    throw new Error("Failed to fetch users");
  }

  return users.map((user) => {
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
  registryId?: string,
) {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

export async function addBlocklistWordAction(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);

  const cleanSlug = slug.toLowerCase().trim();
  if (!cleanSlug || cleanSlug.length < 2) {
    return { ok: false, error: "Subdomain must be at least 2 characters." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("subdomain_blocklist")
    .select("slug")
    .eq("slug", cleanSlug)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "Subdomain is already in the blocklist." };
  }

  const { error } = await supabase
    .from("subdomain_blocklist")
    .insert({ slug: cleanSlug });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/admin/blocklist", "page");
  return { ok: true };
}

export async function removeBlocklistWordAction(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);

  const cleanSlug = slug.toLowerCase().trim();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("subdomain_blocklist")
    .delete()
    .eq("slug", cleanSlug);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/admin/blocklist", "page");
  return { ok: true };
}
