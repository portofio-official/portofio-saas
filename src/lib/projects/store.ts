import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectSummary, ProjectVersion, ProjectWithDraft } from "./types";
import type { WebsiteDocument } from "@/templates/definition";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Project {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    name: row.name as string,
    templateId: row.template_id as string,
    templateVersion: row.template_version as number,
    currentVersionId: (row.current_version_id as string | null) ?? null,
    publishedVersionId: (row.published_version_id as string | null) ?? null,
    subdomain: (row.subdomain as string | null) ?? null,
    status: row.status as "draft" | "published",
    publishedAt: (row.published_at as string | null) ?? null,
    profileSyncedAt: (row.profile_synced_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    draftJson: (row.draft_json ?? {}) as WebsiteDocument,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVersionRow(row: Record<string, any>): ProjectVersion {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    versionNumber: row.version_number as number,
    contentJson: row.content_json as WebsiteDocument,
    schemaVersion: row.schema_version as number,
    isAutosave: row.is_autosave as boolean,
    createdAt: row.created_at as string,
    createdBy: (row.created_by as string | null) ?? null,
  };
}

export async function listProjects(workspaceId: string): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, template_id, status, subdomain, updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    templateId: r.template_id,
    status: r.status,
    subdomain: r.subdomain ?? null,
    updatedAt: r.updated_at,
  }));
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getProjectWithDraft(projectId: string): Promise<ProjectWithDraft | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  // The live editable draft lives in projects.draft_json (single autosave
  // upsert). project_versions only holds bounded history snapshots now.
  return {
    ...project,
    draftVersion: {
      id: project.id,
      projectId,
      versionNumber: 0,
      contentJson: project.draftJson,
      schemaVersion: project.templateVersion,
      isAutosave: true,
      createdAt: project.updatedAt,
      createdBy: null,
    },
  };
}

export async function getProjectVersion(versionId: string): Promise<ProjectVersion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !data) return null;
  return mapVersionRow(data);
}

export async function listProjectVersions(
  projectId: string,
  limit = 20,
): Promise<ProjectVersion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 50));

  if (error || !data) return [];
  return data.map((row) => mapVersionRow(row));
}

export async function getProjectCurrentDraft(projectId: string): Promise<ProjectVersion | null> {
  const project = await getProject(projectId);
  if (!project) return null;
  return {
    id: project.id,
    projectId,
    versionNumber: 0,
    contentJson: project.draftJson,
    schemaVersion: project.templateVersion,
    isAutosave: true,
    createdAt: project.updatedAt,
    createdBy: null,
  };
}

export async function getProjectPublishedVersion(projectId: string): Promise<ProjectVersion | null> {
  const project = await getProject(projectId);
  if (!project || !project.publishedVersionId) return null;
  return getProjectVersion(project.publishedVersionId);
}

export async function hasProfileDiverged(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("workspace_id, profile_synced_at")
    .eq("id", projectId)
    .maybeSingle();

  if (!project || !project.workspace_id) return false;

  const { data: profile } = await supabase
    .from("workspace_profile")
    .select("updated_at")
    .eq("workspace_id", project.workspace_id)
    .maybeSingle();

  if (!profile || !profile.updated_at) return false;
  if (!project.profile_synced_at) return true;

  const profileUpdated = new Date(profile.updated_at).getTime();
  const projectSynced = new Date(project.profile_synced_at).getTime();

  return profileUpdated > projectSynced;
}

export async function createProject(
  workspaceId: string,
  name: string,
  templateId: string,
  initialDocument: WebsiteDocument,
): Promise<ProjectWithDraft | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Create project row (draft_json holds the editable draft from the start)
  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      template_id: templateId,
      template_version: initialDocument.meta.templateVersion,
      draft_json: initialDocument,
      profile_synced_at: now,
    })
    .select("*")
    .single();

  if (projectError || !projectRow) return null;
  const project = mapRow(projectRow);

  // 2. Create initial version 1 in project_versions
  const { data: versionRow, error: versionError } = await supabase
    .from("project_versions")
    .insert({
      project_id: project.id,
      version_number: 1,
      content_json: initialDocument,
      schema_version: initialDocument.meta.templateVersion,
      is_autosave: false,
    })
    .select("*")
    .single();

  if (versionError || !versionRow) return null;
  const draftVersion = mapVersionRow(versionRow);

  // 3. Update current_version_id on projects table
  const { error: updateError } = await supabase
    .from("projects")
    .update({ current_version_id: draftVersion.id })
    .eq("id", project.id);

  if (updateError) return null;

  return {
    ...project,
    currentVersionId: draftVersion.id,
    draftVersion,
  };
}

export async function saveDraftJson(
  projectId: string,
  draftJson: WebsiteDocument,
): Promise<boolean> {
  const supabase = await createClient();

  // Single in-place upsert on projects.draft_json — no new project_versions
  // row per autosave, so there is no max(version_number)+1 race and no
  // unbounded history growth.
  const { error } = await supabase
    .from("projects")
    .update({
      draft_json: draftJson,
      template_version: draftJson.meta.templateVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  return !error;
}

export type PublishResult = {
  ok: boolean;
  error?: string;
};

export async function publishProject(projectId: string, subdomain: string): Promise<PublishResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_project", {
    p_project_id: projectId,
    p_subdomain: subdomain,
  });
  if (!error) return { ok: true };

  // The hardened RPC raises distinct exceptions that map 1:1 to user messages.
  const message = typeof error.message === "string" ? error.message : "";
  return { ok: false, error: message };
}

export async function unpublishProject(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", projectId);
  return !error;
}
