import { createClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/workspace";
import { TEMPLATE_IDS, type TemplateId } from "@/templates/types";
import type { BasePortfolioData } from "@/templates/shared/_base";

// RLS (workspaces_owner_all, to authenticated) already scopes these to the
// caller's own workspaces — no manual user_id filter needed.
export async function listWorkspaces(): Promise<Workspace[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const previews = await getFirstProjectPreviews(data.map((w) => w.id));

  return data.map((w) => ({
    id: w.id,
    name: w.name,
    createdAt: w.created_at,
    updatedAt: previews.get(w.id)?.updatedAt ?? w.created_at,
    publishStatus: previews.get(w.id)?.status ?? null,
    subdomain: previews.get(w.id)?.subdomain ?? null,
    preview: previews.get(w.id) ? { templateId: previews.get(w.id)!.templateId, data: previews.get(w.id)!.data } : null,
  }));
}

// One project per workspace card thumbnail — the same "first project" a
// workspace's editor auto-opens (see EditorPage's `projects[0]`).
async function getFirstProjectPreviews(workspaceIds: string[]): Promise<
  Map<string, { templateId: TemplateId; data: BasePortfolioData; status: "draft" | "published"; subdomain: string | null; updatedAt?: string }>
> {
  const previews = new Map<string, { templateId: TemplateId; data: BasePortfolioData; status: "draft" | "published"; subdomain: string | null; updatedAt?: string }>();
  if (workspaceIds.length === 0) return previews;

  const supabase = await createClient();
  const { data: projectRows, error: projectError } = await supabase
    .from("projects")
    .select("workspace_id, template_id, current_version_id, draft_json, status, subdomain")
    .in("workspace_id", workspaceIds)
    .order("created_at", { ascending: true });

  if (projectError || !projectRows) return previews;

  // Collect version IDs for fallback
  const versionIds = projectRows
    .map((r) => r.current_version_id)
    .filter((id): id is string => Boolean(id));

  const contentMap = new Map<string, { data: Record<string, unknown>; updatedAt?: string }>();

  if (versionIds.length > 0) {
    const { data: versionRows } = await supabase
      .from("project_versions")
      .select("id, content_json")
      .in("id", versionIds);

    if (versionRows) {
      for (const v of versionRows) {
        const doc = v.content_json as { data?: Record<string, unknown>; meta?: { updatedAt?: string } } | null;
        if (doc?.data) {
          contentMap.set(v.id, { data: doc.data, updatedAt: doc.meta?.updatedAt });
        }
      }
    }
  }

  // Most recent edit per workspace, from its projects' current draft versions.
  const lastEdited = new Map<string, string>();
  for (const row of projectRows) {
    const entry = row.current_version_id ? contentMap.get(row.current_version_id) : undefined;
    if (!entry?.updatedAt) continue;
    const current = lastEdited.get(row.workspace_id);
    if (!current || entry.updatedAt > current) lastEdited.set(row.workspace_id, entry.updatedAt);
  }

  for (const row of projectRows) {
    if (previews.has(row.workspace_id)) continue;
    if (!TEMPLATE_IDS.includes(row.template_id as TemplateId)) continue;

    const draftDoc = row.draft_json as { data?: Record<string, unknown> } | null;
    const dataObj = draftDoc?.data ?? (row.current_version_id ? contentMap.get(row.current_version_id) : undefined);

    previews.set(row.workspace_id, {
      templateId: row.template_id as TemplateId,
      data: (dataObj ?? {}) as BasePortfolioData,
      status: (row.status as "draft" | "published") ?? "draft",
      subdomain: (row.subdomain as string | null) ?? null,
    });
  }

  return previews;
}

// Template IDs currently used across the authenticated user's projects — shown
// as an "in use" badge on the dashboard template gallery.
export async function getInUseTemplateIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("template_id")
    .order("created_at", { ascending: true });
  const ids = new Set<string>();
  for (const row of data ?? []) {
    if (TEMPLATE_IDS.includes(row.template_id as TemplateId)) ids.add(row.template_id as string);
  }
  return [...ids];
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, name: data.name, createdAt: data.created_at };
}
