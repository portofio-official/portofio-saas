import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { getDefinition } from "@/templates/registry";
import { parseDocumentData, type WebsiteDocument, type WorkspaceProfile } from "@/templates/definition";
import { TEMPLATE_IDS, type TemplateId } from "@/templates/types";
import { sanitizeObjectData } from "@/lib/utils";

// Revalidate public site pages every 60 seconds (ISR caching)
export const revalidate = 60;

async function getPublishedProject(subdomain: string) {
  const supabase = createPublicClient();
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
  // Self-contained inline beacon: records the page view (page_visits via
  // /api/track) and, once the DOM is ready, watches sections ([data-section-key]
  // or <section id>) with an IntersectionObserver. Each distinct section is
  // reported at most once per visitor session (section_visits → engage data).
  const trackScript = `(function(){try{var K="__pvf_vid",v="";try{v=sessionStorage.getItem(K)||""}catch(e){}
 if(!v){try{v=(crypto.randomUUID?crypto.randomUUID():"v"+Math.random().toString(36).slice(2)+Date.now().toString(36));sessionStorage.setItem(K,v)}catch(e){v=""}}
 var base={subdomain:${JSON.stringify(subdomain)},path:location.pathname+location.search,visitorHash:v};
 function post(b){if(navigator.sendBeacon){navigator.sendBeacon("/api/track",new Blob([JSON.stringify(b)],{type:"application/json"}))}
 else{fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b),keepalive:true})}}
 post(base);
 var seen={};
 function labelOf(el){try{var h=el.querySelector("h1,h2,h3");if(h){var t=(h.textContent||"").trim().replace(/\\s+/g," ");if(t)return t.slice(0,60)}}catch(e){}return""}
 function trySection(el){var k="";try{k=(el.getAttribute("data-section-key")||el.id||"").trim()}catch(e){}
 if(!k||k.length>240||seen[k])return;seen[k]=1;
 post({type:"section",section:{key:k,label:labelOf(el)||k},subdomain:base.subdomain,path:base.path,visitorHash:v});}
 function init(){try{if(!("IntersectionObserver" in window))return;
 var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){if(es[i].isIntersecting&&es[i].intersectionRatio>=0.1){trySection(es[i].target)}}},{threshold:[0.1,0.25],rootMargin:"0px 0px -8% 0px"});
 var els=document.querySelectorAll("[data-section-key],section[id]");for(var j=0;j<els.length;j++){io.observe(els[j])}}catch(e){}}
 if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}
}catch(e){}})();`;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script dangerouslySetInnerHTML={{ __html: trackScript }} />
      <Renderer data={data} workspaceProfile={workspaceProfile} />
    </>
  );
}
