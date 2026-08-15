"use server";

import {
  createProject,
  saveDraftJson,
  publishProject,
  unpublishProject,
  getProjectWithDraft,
  listProjectVersions,
  getProjectVersion,
} from "./store";
import { buildInitialDocument, type WebsiteDocument } from "@/templates/definition";
import { getDefinition } from "@/templates/registry";
import { getUserProfile } from "@/lib/profile/queries";
import { checkSubscription } from "@/lib/billing/subscription";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { sanitizeObjectData } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { listContentItems } from "@/lib/content/store";
import { resolveLibraryData } from "@/lib/content";
import { requireRole } from "@/lib/auth/roles";

export async function createProjectAction(
  workspaceId: string,
  name: string,
  templateId: string,
  locale = "id",
): Promise<{ ok: boolean; projectId?: string; error?: string }> {
  await requireRole(["user", "designer"]);
  const definition = getDefinition(templateId);
  if (!definition) return { ok: false, error: "Template not found" };

  const profile = await getUserProfile();
  if (!profile) return { ok: false, error: "notAuthenticated" };
  const initialDoc = buildInitialDocument(profile, definition, locale);

  const project = await createProject(workspaceId, name, templateId, initialDoc);
  if (!project) return { ok: false, error: "Failed to create project" };
  return { ok: true, projectId: project.id };
}

export async function saveDraftAction(
  projectId: string,
  draftJson: WebsiteDocument,
): Promise<{ ok: boolean }> {
  await requireRole(["user", "designer"]);
  const project = await getProjectWithDraft(projectId);
  if (!project) return { ok: false };
  const libraryItems = await listContentItems();
  const sanitizedDraft = sanitizeObjectData({
    ...draftJson,
    data: resolveLibraryData(draftJson.data, libraryItems),
  });
  const ok = await saveDraftJson(projectId, sanitizedDraft);
  return { ok };
}

export async function syncFromProfileAction(
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const projectWithDraft = await getProjectWithDraft(projectId);
  if (!projectWithDraft) return { ok: false, error: "Project not found" };

  const profile = await getUserProfile();
  if (!profile) return { ok: false, error: "notAuthenticated" };
  const currentDoc = projectWithDraft.draftVersion.contentJson;
  const currentData = { ...(currentDoc.data ?? {}) } as Record<string, unknown>;

  // Merge profile fields into document data
  if ("profile" in currentData && typeof currentData.profile === "object") {
    currentData.profile = {
      ...(currentData.profile as Record<string, unknown>),
      fullName: profile.full_name ?? (currentData.profile as Record<string, unknown>).fullName ?? "",
      nickname: profile.nickname ?? (currentData.profile as Record<string, unknown>).nickname ?? "",
      headline: profile.headline ?? (currentData.profile as Record<string, unknown>).headline ?? "",
      bio: profile.bio ?? (currentData.profile as Record<string, unknown>).bio ?? "",
      location: profile.address ?? (currentData.profile as Record<string, unknown>).location ?? "",
      photoUrl: profile.avatar_url ?? (currentData.profile as Record<string, unknown>).photoUrl ?? "",
    };
  }

  if ("contact" in currentData && typeof currentData.contact === "object") {
    currentData.contact = {
      ...(currentData.contact as Record<string, unknown>),
      email: profile.contact_email ?? (currentData.contact as Record<string, unknown>).email ?? "",
      phone: profile.phone ?? (currentData.contact as Record<string, unknown>).phone ?? "",
    };
  }

  if ("socials" in currentData && Array.isArray(currentData.socials)) {
    // Only overwrite if profile has socials, otherwise keep existing
    if (profile.socials && profile.socials.length > 0) {
      currentData.socials = profile.socials;
    }
  }

  if ("skills" in currentData && Array.isArray(currentData.skills)) {
    if (profile.skills && profile.skills.length > 0) {
      currentData.skills = profile.skills;
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
  await requireRole(["user", "designer"]);
  // Fast, user-friendly format validation (the RPC enforces the rest).
  const formatError = validateSubdomain(subdomain);
  if (formatError) return { ok: false, error: formatError };

  // Rate limit: 10 publish attempts per hour per user
  const email = await getCurrentUserEmail();
  if (!email) return { ok: false, error: "Not authenticated." };

  const rate = await checkRateLimit(`publish:${email}`, 10, 60 * 60 * 1000);
  if (!rate.allowed) {
    return { ok: false, error: `Batas percobaan publish terlampaui. Coba lagi dalam ${rate.retryAfterSeconds} detik.` };
  }

  // Early billing gate so the UI can route to checkout without heavy work.
  // The RPC re-enforces this atomically (defense in depth).
  const hasSubscription = await checkSubscription(email);
  if (!hasSubscription) return { ok: false, error: "subscription_required", requiresSubscription: true };

  const projectWithDraft = await getProjectWithDraft(projectId);
  if (!projectWithDraft) return { ok: false, error: "Project not found." };

  const libraryItems = await listContentItems();
  const resolvedDraft: WebsiteDocument = {
    ...projectWithDraft.draftVersion.contentJson,
    data: resolveLibraryData(projectWithDraft.draftVersion.contentJson.data, libraryItems),
  };
  if (!(await saveDraftJson(projectId, sanitizeObjectData(resolvedDraft)))) {
    return { ok: false, error: "Failed to sync Content Library." };
  }

  // Atomic enforcement lives in the publish_project RPC: ownership, blocklist,
  // subdomain uniqueness, one-live-site quota, and the subscription gate are
  // checked inside a single transaction.
  const result = await publishProject(projectId, subdomain);
  if (!result.ok) {
    switch (result.error) {
      case "subscription_required":
        return { ok: false, error: "subscription_required", requiresSubscription: true };
      case "subdomain_blocked":
        return { ok: false, error: "This subdomain name is reserved." };
      case "subdomain_taken":
        return { ok: false, error: "This subdomain is already taken. Please choose another." };
      case "one_live_site_per_account":
        return {
          ok: false,
          error: "Anda hanya dapat mempublikasikan 1 website per akun. Mohon unpublish website Anda yang lain terlebih dahulu.",
        };
      default:
        return { ok: false, error: "Failed to publish. Please try again." };
    }
  }
  return { ok: true };
}

export async function unpublishProjectAction(
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const ok = await unpublishProject(projectId);
  if (!ok) return { ok: false, error: "Failed to unpublish. Please try again." };
  return { ok: true };
}

export async function listProjectVersionsAction(projectId: string) {
  await requireRole(["user", "designer"]);
  const project = await getProjectWithDraft(projectId);
  if (!project) return [];
  return listProjectVersions(projectId);
}

export async function restoreProjectVersionAction(
  projectId: string,
  versionId: string,
): Promise<{ ok: boolean; document?: WebsiteDocument; error?: string }> {
  await requireRole(["user", "designer"]);
  const project = await getProjectWithDraft(projectId);
  if (!project) return { ok: false, error: "Project not found" };

  const version = await getProjectVersion(versionId);
  if (!version || version.projectId !== projectId) {
    return { ok: false, error: "Version not found" };
  }

  const restoredDocument: WebsiteDocument = {
    ...version.contentJson,
    meta: {
      ...version.contentJson.meta,
      updatedAt: new Date().toISOString(),
    },
  };
  const ok = await saveDraftJson(projectId, restoredDocument);

  if (!ok) return { ok: false, error: "Failed to restore version" };
  return { ok: true, document: restoredDocument };
}
