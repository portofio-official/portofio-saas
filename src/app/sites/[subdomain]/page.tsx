import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const project = await getPublishedProject(subdomain);
  if (!project) {
    return {
      title: "Site Tidak Ditemukan — Portofio",
    };
  }

  const rawDoc = project.published_json as WebsiteDocument;
  const doc = sanitizeObjectData(rawDoc);
  const docData = (doc?.data ?? {}) as Record<string, unknown>;
  const profile = (docData.profile ?? {}) as Record<string, unknown>;

  const fullName = (profile.fullName as string) || (profile.name as string) || subdomain;
  const headline = (profile.headline as string) || (profile.bio as string) || "Portfolio";
  const photoUrl = (profile.photoUrl as string) || (profile.avatarUrl as string) || undefined;

  // Custom SEO overrides from WebsiteDocument.meta.seo (set in the editor)
  const metaSeo = (doc?.meta?.seo ?? {}) as { title?: string; description?: string; ogImage?: string };
  const title = metaSeo.title?.trim() || `${fullName} — Portfolio`;
  const description = metaSeo.description?.trim() || headline;
  const seoImage = metaSeo.ogImage?.trim() || photoUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: seoImage ? [{ url: seoImage }] : undefined,
    },
    twitter: {
      card: seoImage ? "summary_large_image" : "summary",
      title,
      description,
      images: seoImage ? [seoImage] : undefined,
    },
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

  // Extract structured data info
  const docData = (doc?.data ?? {}) as Record<string, unknown>;
  const profile = (docData.profile ?? {}) as Record<string, unknown>;
  const fullName = (profile.fullName as string) || (profile.name as string) || subdomain;
  const headline = (profile.headline as string) || (profile.bio as string) || "";
  const photoUrl = (profile.photoUrl as string) || (profile.avatarUrl as string) || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    description: headline,
    image: photoUrl,
  };

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Renderer data={data} workspaceProfile={workspaceProfile} />
    </>
  );
}
