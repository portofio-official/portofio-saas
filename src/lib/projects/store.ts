import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectSummary } from "./types";
import type { WebsiteDocument } from "@/lib/templates/definition";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Project {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    name: row.name as string,
    templateId: row.template_id as string,
    templateVersion: row.template_version as number,
    draftJson: row.draft_json as WebsiteDocument,
    publishedJson: (row.published_json as WebsiteDocument | null) ?? null,
    subdomain: (row.subdomain as string | null) ?? null,
    status: row.status as "draft" | "published",
    publishedAt: (row.published_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
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

export async function createProject(
  workspaceId: string,
  name: string,
  templateId: string,
  initialDocument: WebsiteDocument,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      template_id: templateId,
      template_version: initialDocument.meta.templateVersion,
      draft_json: initialDocument,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapRow(data);
}

export async function saveDraftJson(
  projectId: string,
  draftJson: WebsiteDocument,
): Promise<boolean> {
  const supabase = await createClient();
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
