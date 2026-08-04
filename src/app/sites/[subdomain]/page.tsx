import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefinition } from "@/templates/registry";
import { parseDocumentData, type WebsiteDocument, type WorkspaceProfile } from "@/templates/definition";
import { TEMPLATE_IDS, type TemplateId } from "@/templates/types";
import { sanitizeObjectData } from "@/lib/utils/sanitize";

// Revalidate public site pages every 60 seconds (ISR caching)
export const revalidate = 60;

async function getPublishedProject(subdomain: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("template_id, template_version, published_version_id, workspace_id")
    .eq("subdomain", subdomain)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data || !data.published_version_id) return null;

  const { data: versionData, error: versionError } = await supabase
    .from("project_versions")
    .select("content_json")
    .eq("id", data.published_version_id)
    .maybeSingle();

  if (versionError || !versionData) return null;

  return {
    template_id: data.template_id,
    template_version: data.template_version,
    workspace_id: data.workspace_id,
    published_json: versionData.content_json,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  const project = await getPublishedProject(subdomain);
  if (!project) notFound();

  const templateId = TEMPLATE_IDS.includes(project.template_id as TemplateId)
    ? (project.template_id as TemplateId)
    : null;
  if (!templateId) notFound();

  const definition = getDefinition(templateId);
  if (!definition) notFound();

  const rawDoc = project.published_json as WebsiteDocument;
  const doc = sanitizeObjectData(rawDoc);
  const data = parseDocumentData(doc, definition);

  // Snapshot pattern: public site renders strictly from published content_json snapshot
  const workspaceProfile: WorkspaceProfile = {
    workspaceId: project.workspace_id,
    name: null,
    logoUrl: null,
    email: null,
    phone: null,
    address: null,
    websiteUrl: null,
    extendedData: {},
  };

  const Renderer = definition.renderer;
  return <Renderer data={data} workspaceProfile={workspaceProfile} />;
}
