"use server";

import { createProject, saveDraftJson, publishProject, unpublishProject, getProjectWithDraft } from "./store";
import { buildInitialDocument, type WebsiteDocument } from "@/templates/definition";
import { getDefinition } from "@/templates/registry";
import { getWorkspaceProfile } from "@/lib/workspace/profile";
import { checkSubscription } from "@/lib/billing/subscription";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { sanitizeObjectData } from "@/lib/utils/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

export async function createProjectAction(
  workspaceId: string,
  name: string,
  templateId: string,
  locale = "id",
): Promise<{ ok: boolean; projectId?: string; error?: string }> {
  const definition = getDefinition(templateId);
  if (!definition) return { ok: false, error: "Template not found" };

  const profile = await getWorkspaceProfile(workspaceId);
  const initialDoc = buildInitialDocument(profile, definition, locale);

  const project = await createProject(workspaceId, name, templateId, initialDoc);
  if (!project) return { ok: false, error: "Failed to create project" };
  return { ok: true, projectId: project.id };
}

export async function saveDraftAction(
  projectId: string,
  draftJson: WebsiteDocument,
): Promise<{ ok: boolean }> {
  const sanitizedDraft = sanitizeObjectData(draftJson);
  const ok = await saveDraftJson(projectId, sanitizedDraft);
  return { ok };
}

export async function syncFromProfileAction(
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  const projectWithDraft = await getProjectWithDraft(projectId);
  if (!projectWithDraft) return { ok: false, error: "Project not found" };

  const profile = await getWorkspaceProfile(projectWithDraft.workspaceId);
  const currentDoc = projectWithDraft.draftVersion.contentJson;
  const currentData = { ...(currentDoc.data ?? {}) } as Record<string, unknown>;

  // Merge profile fields into document data
  if ("profile" in currentData && typeof currentData.profile === "object" && currentData.profile !== null) {
    currentData.profile = {
      ...(currentData.profile as Record<string, unknown>),
      fullName: profile.name ?? (currentData.profile as Record<string, unknown>).fullName ?? "",
    };
  }

  if ("contact" in currentData && typeof currentData.contact === "object" && currentData.contact !== null) {
    currentData.contact = {
      ...(currentData.contact as Record<string, unknown>),
      email: profile.email ?? (currentData.contact as Record<string, unknown>).email ?? "",
      phone: profile.phone ?? (currentData.contact as Record<string, unknown>).phone ?? "",
    };
  }

  if ("socials" in currentData && Array.isArray(currentData.socials)) {
    if (profile.extendedData.socials && profile.extendedData.socials.length > 0) {
      currentData.socials = profile.extendedData.socials;
    }
  }

  const updatedDoc: WebsiteDocument = {
    ...currentDoc,
    meta: {
      ...currentDoc.meta,
      updatedAt: new Date().toISOString(),
    },
    data: currentData,
  };

  const saveOk = await saveDraftJson(projectId, updatedDoc);
  if (!saveOk) return { ok: false, error: "Failed to save synced draft" };

  // Update profile_synced_at timestamp
  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase
    .from("projects")
    .update({ profile_synced_at: now })
    .eq("id", projectId);

  return { ok: true };
}

// Forbidden subdomain words (ponytail: minimal list, expand before go-live)
const FORBIDDEN_SUBDOMAINS = new Set([
  "www", "api", "app", "admin", "mail", "smtp", "ftp", "ns1", "ns2",
  "portofio", "dashboard", "login", "signup", "auth", "support", "help",
]);

function validateSubdomain(subdomain: string): string | null {
  if (!subdomain) return "Subdomain is required.";
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain))
    return "Only lowercase letters, numbers, and hyphens. Must start and end with a letter or number.";
  if (subdomain.length < 3) return "At least 3 characters.";
  if (subdomain.length > 63) return "At most 63 characters.";
  if (FORBIDDEN_SUBDOMAINS.has(subdomain)) return "This subdomain name is reserved.";
  return null;
}

export async function publishProjectAction(
  projectId: string,
  subdomain: string,
): Promise<{ ok: boolean; error?: string; requiresSubscription?: boolean }> {
  // Validate format
  const formatError = validateSubdomain(subdomain);
  if (formatError) return { ok: false, error: formatError };

  // Subscription gate
  const email = await getCurrentUserEmail();
  if (!email) return { ok: false, error: "Not authenticated." };

  // Rate limit: 10 publish attempts per hour per user
  const rate = checkRateLimit(`publish:${email}`, 10, 60 * 60 * 1000);
  if (!rate.allowed) {
    return { ok: false, error: `Batas percobaan publish terlampaui. Coba lagi dalam ${rate.retryAfterSeconds} detik.` };
  }

  const hasSubscription = await checkSubscription(email);
  if (!hasSubscription) return { ok: false, error: "subscription_required", requiresSubscription: true };

  const supabase = await createClient();

  // Check DB blocklist
  const { data: blocked } = await supabase
    .from("subdomain_blocklist")
    .select("slug")
    .eq("slug", subdomain)
    .maybeSingle();
  if (blocked) return { ok: false, error: "This subdomain name is reserved." };

  // Check subdomain uniqueness (skip own project)
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("subdomain", subdomain)
    .neq("id", projectId)
    .maybeSingle();
  if (existing) return { ok: false, error: "This subdomain is already taken. Please choose another." };

  // Check single published website per user account limit
  const { data: userWorkspaces } = await supabase.from("workspaces").select("id");
  if (userWorkspaces && userWorkspaces.length > 0) {
    const workspaceIds = userWorkspaces.map((w) => w.id);
    const { data: otherPublished } = await supabase
      .from("projects")
      .select("id, name")
      .in("workspace_id", workspaceIds)
      .eq("status", "published")
      .neq("id", projectId)
      .maybeSingle();

    if (otherPublished) {
      return {
        ok: false,
        error: "Anda hanya dapat mempublikasikan 1 website per akun. Mohon unpublish website Anda yang lain terlebih dahulu.",
      };
    }
  }

  const ok = await publishProject(projectId, subdomain);
  if (!ok) return { ok: false, error: "Failed to publish. Please try again." };
  return { ok: true };
}

export async function unpublishProjectAction(
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  const ok = await unpublishProject(projectId);
  if (!ok) return { ok: false, error: "Failed to unpublish. Please try again." };
  return { ok: true };
}
