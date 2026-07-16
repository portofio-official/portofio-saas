"use server";

import { createProject, saveDraftJson, publishProject, unpublishProject } from "./store";
import { buildInitialDocument, type WebsiteDocument } from "@/lib/templates/definition";
import { getDefinition } from "@/components/templates/registry";
import { getWorkspaceProfile } from "@/lib/workspace/profile";
import { checkSubscription } from "@/lib/billing/subscription";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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
  const ok = await saveDraftJson(projectId, draftJson);
  return { ok };
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
  const hasSubscription = await checkSubscription(email);
  if (!hasSubscription) return { ok: false, error: "subscription_required", requiresSubscription: true };

  // Check subdomain uniqueness (skip own project)
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("subdomain", subdomain)
    .neq("id", projectId)
    .maybeSingle();
  if (existing) return { ok: false, error: "This subdomain is already taken. Please choose another." };

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
