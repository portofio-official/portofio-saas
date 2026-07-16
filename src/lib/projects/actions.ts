"use server";

import { createProject, saveDraftJson } from "./store";
import { buildInitialDocument, type WebsiteDocument } from "@/lib/templates/definition";
import { getDefinition } from "@/components/templates/registry";
import { getWorkspaceProfile } from "@/lib/workspace/profile";

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
