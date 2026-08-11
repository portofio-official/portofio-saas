"use server";

import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AppRole } from "@/lib/auth/roles";

export type AdminUserView = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  createdAt: string;
  isSuspended: boolean;
};

export type AdminAuditLogView = {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

async function recordAdminAudit(
  action: string,
  targetType: string,
  targetId: string | null,
  metadata: Record<string, unknown> = {},
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Admin session not found");

  const { error } = await createAdminClient().from("admin_audit_logs").insert({
    actor_id: user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: { ...metadata, outcome: "requested" },
  });
  if (error) {
    console.error("Failed to write admin audit log:", error);
    throw new Error("Admin audit log is unavailable");
  }
}

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

  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("Invalid user id");
  const supabase = await createClient();
  const { data: { user: actor } } = await supabase.auth.getUser();
  if (actor?.id === userId) throw new Error("You cannot suspend your own admin account");

  await recordAdminAudit("user.suspension", "user", userId, { suspend });

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

export async function updateUserRoleAction(
  userId: string,
  role: AppRole,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return { ok: false, error: "Invalid user id" };
  if (!["user", "designer", "admin"].includes(role)) return { ok: false, error: "Invalid role" };

  const supabase = await createClient();
  const { data: { user: actor } } = await supabase.auth.getUser();
  if (actor?.id === userId && role !== "admin") {
    return { ok: false, error: "You cannot remove your own admin role" };
  }

  await recordAdminAudit("user.role_change", "user", userId, { role });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error(`Failed to update role for user ${userId}:`, error);
    return { ok: false, error: "Failed to update user role" };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateTemplateStatusAction(
  submissionId: string,
  status: "approved" | "rejected" | "revision_requested",
  reviewNotes?: string,
  registryId?: string,
) {
  await requireRole(["admin"]);

  if ((status === "rejected" || status === "revision_requested") && !reviewNotes?.trim()) {
    throw new Error("Review notes are required for this decision");
  }
  if (registryId && !/^[a-z0-9][a-z0-9-]{1,62}$/.test(registryId.trim())) {
    throw new Error("Invalid registry_id");
  }

  const adminClient = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cleanNotes = reviewNotes?.trim().slice(0, 2000) || null;

  await recordAdminAudit("template.review", "template_submission", submissionId, {
    status,
    registryId: registryId?.trim() || null,
    reviewNotes: cleanNotes,
  });

  const { error } = await adminClient
    .from("template_submissions")
    .update({
      status,
      review_notes: cleanNotes,
      registry_id: registryId?.trim() || null,
      integration_status: status === "approved" ? "in_review" : "not_started",
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

export type AdminTemplateSubmissionView = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  integrationStatus: string;
  integrationNotes: string | null;
  registryId: string | null;
  previewUrl: string | null;
  previewMobileUrl: string | null;
  sourceFilename: string | null;
  sourceSizeBytes: number | null;
  designerId: string;
  designerEmail: string;
  designerName: string | null;
  createdAt: string;
  submittedAt: string | null;
};

export async function getTemplateSubmissionsAction(): Promise<AdminTemplateSubmissionView[]> {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("template_submissions")
    .select("id, name, description, status, integration_status, integration_notes, registry_id, preview_url, preview_mobile_url, source_filename, source_size_bytes, designer_id, created_at, submitted_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list template submissions:", error);
    throw new Error("Failed to fetch template submissions");
  }

  return Promise.all((data ?? []).map(async (submission) => {
    const { data: authData } = await adminClient.auth.admin.getUserById(submission.designer_id);
    const user = authData.user;
    return {
      id: submission.id,
      name: submission.name,
      description: submission.description,
      status: submission.status,
      integrationStatus: submission.integration_status,
      integrationNotes: submission.integration_notes,
      registryId: submission.registry_id,
      previewUrl: submission.preview_url,
      previewMobileUrl: submission.preview_mobile_url,
      sourceFilename: submission.source_filename,
      sourceSizeBytes: submission.source_size_bytes,
      designerId: submission.designer_id,
      designerEmail: user?.email ?? "Unknown",
      designerName: (user?.user_metadata?.full_name as string | undefined) ?? null,
      createdAt: submission.created_at,
      submittedAt: submission.submitted_at,
    };
  }));
}

export async function createTemplateSourceDownloadUrlAction(
  submissionId: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireRole(["admin"]);
  const adminClient = createAdminClient();
  const { data: submission, error: submissionError } = await adminClient
    .from("template_submissions")
    .select("source_path")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) return { ok: false, error: "notFound" };
  if (!submission.source_path) return { ok: false, error: "sourceMissing" };

  const { data, error } = await adminClient.storage
    .from("template-submissions")
    .createSignedUrl(submission.source_path, 10 * 60);

  if (error || !data?.signedUrl) return { ok: false, error: "downloadFailed" };
  return { ok: true, url: data.signedUrl };
}

export async function updateTemplateIntegrationAction(
  submissionId: string,
  integrationStatus: "not_started" | "in_review" | "merged" | "failed",
  integrationNotes?: string,
  registryId?: string,
) {
  await requireRole(["admin"]);
  if (registryId && !/^[a-z0-9][a-z0-9-]{1,62}$/.test(registryId.trim())) {
    throw new Error("Invalid registry_id");
  }
  if (integrationStatus === "merged" && !registryId?.trim()) {
    throw new Error("registry_id is required when integration is merged");
  }
  await recordAdminAudit("template.integration", "template_submission", submissionId, {
    integrationStatus,
    integrationNotes: integrationNotes?.trim().slice(0, 2000) || null,
    registryId: registryId?.trim() || null,
  });
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("template_submissions")
    .update({
      integration_status: integrationStatus,
      integration_notes: integrationNotes?.trim() || null,
      integrated_at: integrationStatus === "merged" ? new Date().toISOString() : null,
      ...(registryId !== undefined ? { registry_id: registryId.trim() || null } : {}),
    })
    .eq("id", submissionId);

  if (error) throw new Error("Failed to update integration status");
  revalidatePath("/admin/templates");
}

export async function toggleTemplateVisibilityAction(templateId: string, isActive: boolean) {
  await requireRole(["admin"]);

  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(templateId)) {
    throw new Error("Invalid template id");
  }
  await recordAdminAudit("template.visibility", "template", templateId, { isActive });

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
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(cleanSlug) || cleanSlug.length < 2 || cleanSlug.length > 63) {
    return { ok: false, error: "Use 2–63 lowercase letters, numbers, or hyphens." };
  }

  await recordAdminAudit("blocklist.add", "subdomain_blocklist", cleanSlug);

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
  const protectedWords = new Set([
    "www", "api", "app", "admin", "mail", "smtp", "ftp", "ns1", "ns2",
    "portofio", "dashboard", "login", "signup", "auth", "support", "help",
  ]);
  if (protectedWords.has(cleanSlug)) {
    return { ok: false, error: "System-reserved subdomains cannot be removed." };
  }
  await recordAdminAudit("blocklist.remove", "subdomain_blocklist", cleanSlug);
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

export async function getAdminAuditLogsAction(): Promise<AdminAuditLogView[]> {
  await requireRole(["admin"]);
  const { data, error } = await createAdminClient()
    .from("admin_audit_logs")
    .select("id, actor_id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to fetch admin audit logs:", error);
    throw new Error("Failed to fetch audit logs");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}
