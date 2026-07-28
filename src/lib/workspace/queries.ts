import { createClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/workspace/types";
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
    publishStatus: previews.get(w.id)?.status ?? null,
    subdomain: previews.get(w.id)?.subdomain ?? null,
    preview: previews.get(w.id) ? { templateId: previews.get(w.id)!.templateId, data: previews.get(w.id)!.data } : null,
  }));
}

// One project per workspace card thumbnail — the same "first project" a
// workspace's editor auto-opens (see EditorPage's `projects[0]`).
async function getFirstProjectPreviews(workspaceIds: string[]): Promise<
  Map<string, { templateId: TemplateId; data: BasePortfolioData; status: "draft" | "published"; subdomain: string | null }>
> {
  const previews = new Map<string, { templateId: TemplateId; data: BasePortfolioData; status: "draft" | "published"; subdomain: string | null }>();
  if (workspaceIds.length === 0) return previews;

  const supabase = await createClient();
  const { data: projectRows, error: projectError } = await supabase
    .from("projects")
    .select("workspace_id, template_id, current_version_id, status, subdomain")
    .in("workspace_id", workspaceIds)
    .order("created_at", { ascending: true });

  if (projectError || !projectRows) return previews;

  // Collect version IDs
  const versionIds = projectRows
    .map((r) => r.current_version_id)
    .filter((id): id is string => Boolean(id));

  const contentMap = new Map<string, Record<string, unknown>>();

  if (versionIds.length > 0) {
    const { data: versionRows } = await supabase
      .from("project_versions")
      .select("id, content_json")
      .in("id", versionIds);

    if (versionRows) {
      for (const v of versionRows) {
        const doc = v.content_json as { data?: Record<string, unknown> } | null;
        if (doc?.data) {
          contentMap.set(v.id, doc.data);
        }
      }
    }
  }

  for (const row of projectRows) {
    if (previews.has(row.workspace_id)) continue;
    if (!TEMPLATE_IDS.includes(row.template_id as TemplateId)) continue;

    const dataObj = row.current_version_id ? contentMap.get(row.current_version_id) : undefined;
    previews.set(row.workspace_id, {
      templateId: row.template_id as TemplateId,
      data: (dataObj ?? {}) as BasePortfolioData,
      status: (row.status as "draft" | "published") ?? "draft",
      subdomain: (row.subdomain as string | null) ?? null,
    });
  }

  return previews;
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
