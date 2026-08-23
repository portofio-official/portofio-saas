"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { getEntitlements } from "@/lib/billing/entitlements";
import { addDomainToVercelProject, checkVercelDomainStatus, removeDomainFromVercelProject } from "./vercel";
import { getCustomDomainForProject } from "./queries";
import type { DnsInstruction } from "./types";

// Lowercase hostname, at least one dot, no scheme/path/port, standard label rules.
const DOMAIN_PATTERN = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

function rootDomain(): string {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000").replace(/^https?:\/\//, "").split(":")[0];
}

function validateDomainFormat(domain: string): string | null {
  const clean = domain.trim().toLowerCase();
  if (!DOMAIN_PATTERN.test(clean)) return "Format domain tidak valid.";
  const root = rootDomain();
  if (clean === root || clean.endsWith(`.${root}`)) {
    return "Domain ini bertabrakan dengan domain Portofio sendiri.";
  }
  return null;
}

async function assertOwnsProject(projectId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id").eq("id", projectId).maybeSingle();
  // RLS (projects_owner_all, to authenticated) already scopes this to rows
  // the caller owns — a miss here means either it doesn't exist or isn't theirs.
  if (!data) return { ok: false, error: "Project not found." };
  return { ok: true };
}

export async function addCustomDomainAction(
  projectId: string,
  domain: string,
): Promise<{ ok: boolean; error?: string; verification?: DnsInstruction[] }> {
  await requireRole(["user", "designer"]);

  const owns = await assertOwnsProject(projectId);
  if (!owns.ok) return { ok: false, error: owns.error };

  const entitlements = await getEntitlements();
  if (!entitlements?.custom_domain) {
    return { ok: false, error: "custom_domain_requires_upgrade" };
  }

  const cleanDomain = domain.trim().toLowerCase();
  const formatError = validateDomainFormat(cleanDomain);
  if (formatError) return { ok: false, error: formatError };

  const existing = await getCustomDomainForProject(projectId);
  if (existing && existing.domain !== cleanDomain) {
    return { ok: false, error: "Project ini sudah punya custom domain. Hapus dulu sebelum menambah yang baru." };
  }

  const vercelResult = await addDomainToVercelProject(cleanDomain);
  if (!vercelResult.ok) {
    return { ok: false, error: vercelResult.error ?? "Gagal menghubungkan domain ke Vercel." };
  }

  const verificationToken = randomBytes(16).toString("hex");
  const supabase = await createClient();
  const { error } = await supabase.from("custom_domains").upsert(
    {
      project_id: projectId,
      domain: cleanDomain,
      status: vercelResult.verified ? "verified" : "pending_verification",
      verification_token: verificationToken,
      last_checked_at: new Date().toISOString(),
      verified_at: vercelResult.verified ? new Date().toISOString() : null,
    },
    { onConflict: "domain" },
  );

  if (error) {
    console.error("[Domains] Failed to save custom domain:", error);
    // Unique constraint on `domain` + RLS on the owner policy's USING clause
    // both reject stealing a domain already attached to someone else's
    // project (Postgres denies the ON CONFLICT DO UPDATE rather than letting
    // it silently reassign ownership) — surface that plainly instead of a
    // raw Postgres/PostgREST error.
    if (error.code === "23505" || error.code === "42501") {
      return { ok: false, error: "Domain ini sudah digunakan oleh project lain." };
    }
    return { ok: false, error: "Gagal menyimpan domain." };
  }

  revalidatePath("/dashboard/billing");
  const verification: DnsInstruction[] = (vercelResult.verification ?? []).map((v) => ({
    type: v.type,
    name: v.domain,
    value: v.value,
  }));
  return { ok: true, verification };
}

export async function checkCustomDomainStatusAction(
  projectId: string,
): Promise<{ ok: boolean; status?: string; error?: string }> {
  await requireRole(["user", "designer"]);
  const owns = await assertOwnsProject(projectId);
  if (!owns.ok) return { ok: false, error: owns.error };

  const record = await getCustomDomainForProject(projectId);
  if (!record) return { ok: false, error: "No custom domain on this project." };

  const result = await checkVercelDomainStatus(record.domain);
  const supabase = await createClient();
  const nextStatus = result.verified ? "verified" : "pending_verification";

  const { error } = await supabase
    .from("custom_domains")
    .update({
      status: nextStatus,
      last_checked_at: new Date().toISOString(),
      verified_at: result.verified ? new Date().toISOString() : null,
    })
    .eq("id", record.id);

  if (error) {
    console.error("[Domains] Failed to update domain status:", error);
    return { ok: false, error: "Gagal memperbarui status domain." };
  }

  revalidatePath("/dashboard/billing");
  return { ok: true, status: nextStatus };
}

export async function removeCustomDomainAction(projectId: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const owns = await assertOwnsProject(projectId);
  if (!owns.ok) return { ok: false, error: owns.error };

  const record = await getCustomDomainForProject(projectId);
  if (!record) return { ok: true }; // already gone

  const vercelResult = await removeDomainFromVercelProject(record.domain);
  if (!vercelResult.ok) {
    console.error("[Domains] Vercel removal failed, removing DB row anyway:", vercelResult.error);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("custom_domains").delete().eq("id", record.id);
  if (error) {
    console.error("[Domains] Failed to delete custom domain row:", error);
    return { ok: false, error: "Gagal menghapus domain." };
  }

  revalidatePath("/dashboard/billing");
  return { ok: true };
}
