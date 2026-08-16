import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyDevice, classifyBrowser } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const SUBDOMAIN_RE = /^[a-z0-9-]{1,100}$/;

function parseReferrerHost(referrer?: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname || "";
    if (!host || host === "localhost") return null;
    return host.length > 120 ? host.slice(0, 120) : host;
  } catch {
    return null;
  }
}

// Public beacon: embedded in published sites. It only records visits for
// currently-published subdomains, stores no raw PII (the raw Referrer URL and
// full user-agent are parsed into short derived fields, not stored), and never
// blocks the visitor's page. Accepts `view` events (page_visits) and `section`
// events (section_visits — section engagement / performance, SP2-031).
export async function POST(req: NextRequest) {
  let body: {
    type?: unknown;
    subdomain?: unknown;
    path?: unknown;
    visitorHash?: unknown;
    section?: { key?: unknown; label?: unknown } | undefined;
  } = {};
  try {
    body = await req.json();
  } catch {
    // Malformed beacon — ignore.
  }

  const subdomain =
    typeof body.subdomain === "string" ? body.subdomain.trim().toLowerCase() : "";
  if (!SUBDOMAIN_RE.test(subdomain)) {
    return new Response(null, { status: 204 });
  }

  const pagePath =
    typeof body.path === "string" && body.path.length > 0 ? body.path.slice(0, 300) : "/";
  const visitorHash =
    typeof body.visitorHash === "string" && body.visitorHash.length >= 4 && body.visitorHash.length <= 128
      ? body.visitorHash.slice(0, 128)
      : null;

  const isSection = body.type === "section";
  let sectionKey: string | null = null;
  let sectionLabel: string | null = null;
  if (isSection) {
    const raw = body.section && typeof body.section.key === "string" ? body.section.key.trim() : "";
    if (!raw || raw.length > 80) return new Response(null, { status: 204 });
    sectionKey = raw;
    if (body.section && typeof body.section.label === "string") {
      const label = body.section.label.trim().slice(0, 140);
      if (label) sectionLabel = label;
    }
  }

  const supabase = createAdminClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id")
    .eq("subdomain", subdomain)
    .eq("status", "published")
    .maybeSingle();

  if (error || !project) {
    return new Response(null, { status: 204 });
  }

  const ua = req.headers.get("user-agent");
  const country = req.headers.get("x-vercel-ip-country");

  if (isSection) {
    await supabase.from("section_visits").insert({
      project_id: project.id,
      subdomain,
      section_key: sectionKey,
      section_label: sectionLabel,
      page_path: pagePath,
      visitor_hash: visitorHash,
      device_type: classifyDevice(ua),
    });
  } else {
    await supabase.from("page_visits").insert({
      project_id: project.id,
      subdomain,
      page_path: pagePath,
      visitor_hash: visitorHash,
      referrer_host: parseReferrerHost(req.headers.get("referer")),
      device_type: classifyDevice(ua),
      browser: classifyBrowser(ua),
      country_code: country && /^[A-Z]{2}$/.test(country) ? country : null,
    });
  }

  return new Response(null, { status: 204 });
}