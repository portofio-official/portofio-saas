import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDefinition } from "@/components/templates/registry";
import { parseDocumentData, type WebsiteDocument, type WorkspaceProfile } from "@/lib/templates/definition";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/templates/types";

async function getPublishedProject(subdomain: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("template_id, template_version, published_json, workspace_id")
    .eq("subdomain", subdomain)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function getWorkspaceProfileForSite(workspaceId: string): Promise<WorkspaceProfile> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_profile")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data) {
    return {
      workspaceId,
      name: null,
      logoUrl: null,
      email: null,
      phone: null,
      address: null,
      websiteUrl: null,
      extendedData: {},
    };
  }
  return {
    workspaceId,
    name: data.name ?? null,
    logoUrl: data.logo_url ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    websiteUrl: data.website_url ?? null,
    extendedData: (data.extended_data as WorkspaceProfile["extendedData"]) ?? {},
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

  const doc = project.published_json as WebsiteDocument;
  const data = parseDocumentData(doc, definition);
  const workspaceProfile = await getWorkspaceProfileForSite(project.workspace_id as string);

  const Renderer = definition.renderer;
  return <Renderer data={data} workspaceProfile={workspaceProfile} />;
}
