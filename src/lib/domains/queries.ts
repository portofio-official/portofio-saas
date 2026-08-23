import { createClient } from "@/lib/supabase/server";
import type { CustomDomainRecord } from "./types";

function mapRow(row: unknown): CustomDomainRecord | null {
  if (!row) return null;
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    projectId: r.project_id as string,
    domain: r.domain as string,
    status: r.status as CustomDomainRecord["status"],
    verificationToken: r.verification_token as string,
    lastCheckedAt: (r.last_checked_at as string | null) ?? null,
    createdAt: r.created_at as string,
    verifiedAt: (r.verified_at as string | null) ?? null,
  };
}

/** RLS-scoped: only ever returns a domain the caller owns. */
export async function getCustomDomainForProject(projectId: string): Promise<CustomDomainRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_domains")
    .select("id, project_id, domain, status, verification_token, last_checked_at, created_at, verified_at")
    .eq("project_id", projectId)
    .neq("status", "removed")
    .maybeSingle();
  return mapRow(data);
}

/**
 * The caller's single published project, if any (PRD: one live website per
 * account across all tiers). Custom domain management attaches to this.
 * `projects_owner_all` (to authenticated) already scopes this to the
 * caller's own rows — no extra user_id filter needed.
 */
export async function getOwnedPublishedProject(): Promise<{ id: string; subdomain: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, subdomain")
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;
  return { id: data.id as string, subdomain: (data.subdomain as string | null) ?? null };
}
