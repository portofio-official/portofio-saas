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
  if (!project || !project.currentVersionId) return null;

  const draftVersion = await getProjectVersion(project.currentVersionId);
  if (!draftVersion) return null;

  return {
    ...project,
    draftVersion,
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

export async function getProjectCurrentDraft(projectId: string): Promise<ProjectVersion | null> {
  const project = await getProject(projectId);
  if (!project || !project.currentVersionId) return null;
  return getProjectVersion(project.currentVersionId);
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

  // 1. Create project row
  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      template_id: templateId,
      template_version: initialDocument.meta.templateVersion,
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

  // Fetch highest current version number for this project
  const { data: maxVersion } = await supabase
    .from("project_versions")
    .select("version_number")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersionNumber = (maxVersion?.version_number ?? 0) + 1;

  // Insert new version
  const { data: newVersion, error: versionError } = await supabase
    .from("project_versions")
    .insert({
      project_id: projectId,
      version_number: nextVersionNumber,
      content_json: draftJson,
      schema_version: draftJson.meta.templateVersion,
      is_autosave: true,
    })
    .select("id")
    .single();

  if (versionError || !newVersion) return false;

  // Update current_version_id and template_version / updated_at
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      current_version_id: newVersion.id,
      template_version: draftJson.meta.templateVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  return !updateError;
}

export async function publishProject(
  projectId: string,
  subdomain: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_project", {
    p_project_id: projectId,
    p_subdomain: subdomain,
  });
  return !error;
}

export async function unpublishProject(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", projectId);
  return !error;
}
