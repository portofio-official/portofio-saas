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

export type AdminTemplateView = { id: string; name: string; isActive: boolean; createdAt: string };

export async function getAdminTemplatesAction(): Promise<AdminTemplateView[]> {
  await requireRole(["admin"]);
  const { data, error } = await createAdminClient()
    .from("templates")
    .select("id, name, is_active, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Failed to fetch templates:", error);
    throw new Error("Failed to fetch templates");
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}

export async function getAdminBlocklistAction(): Promise<string[]> {
  await requireRole(["admin"]);
  const { data, error } = await createAdminClient().from("subdomain_blocklist").select("slug").order("slug");
  if (error) {
    console.error("Failed to fetch blocklist:", error);
    throw new Error("Failed to fetch blocklist");
  }
  return (data ?? []).map((row) => row.slug);
}

export type AdminAttentionSummary = {
  suspendedUsers: number;
  pendingDomains: number;
  hiddenTemplates: number;
};

/**
 * Real, currently-available signals only — no fabricated moderation queue.
 * A dedicated Designer-submission review queue existed once
 * (20260811000008_designer_submissions.sql) but was deliberately dropped
 * (20260822000001_drop_designer_submissions.sql); there is no pending-QA
 * data source to surface here until that (or a replacement) exists.
 */
export async function getAdminAttentionSummaryAction(): Promise<AdminAttentionSummary> {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  const [{ data: { users } = { users: [] } }, { count: pendingDomains }, { data: templates }] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from("custom_domains").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
    admin.from("templates").select("is_active"),
  ]);

  return {
    suspendedUsers: users.filter((u) => !!u.banned_until).length,
    pendingDomains: pendingDomains ?? 0,
    hiddenTemplates: (templates ?? []).filter((t) => !t.is_active).length,
  };
}

export type AdminSearchIndex = {
  users: { id: string; label: string; email: string }[];
  templates: { id: string; name: string }[];
  blocklist: string[];
};

/** One combined, read-only fetch for the command palette — reuses existing queries, no new endpoint. */
export async function getAdminSearchIndexAction(): Promise<AdminSearchIndex> {
  const [users, templates, blocklist] = await Promise.all([
    getUsersAction(),
    getAdminTemplatesAction(),
    getAdminBlocklistAction(),
  ]);
  return {
    users: users.map((u) => ({ id: u.id, label: u.fullName || u.email, email: u.email })),
    templates: templates.map((t) => ({ id: t.id, name: t.name })),
    blocklist,
  };
}
