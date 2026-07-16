import { createClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/workspace/types";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/templates/types";
import type { BasePortfolioData } from "@/lib/templates/schemas/_base";

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
    preview: previews.get(w.id) ?? null,
  }));
}

// One project per workspace card thumbnail — the same "first project" a
// workspace's editor auto-opens (see EditorPage's `projects[0]`).
async function getFirstProjectPreviews(
  workspaceIds: string[],
): Promise<Map<string, { templateId: TemplateId; data: BasePortfolioData }>> {
  const previews = new Map<string, { templateId: TemplateId; data: BasePortfolioData }>();
  if (workspaceIds.length === 0) return previews;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("workspace_id, template_id, draft_json")
    .in("workspace_id", workspaceIds)
    .order("created_at", { ascending: true });

  if (error || !data) return previews;

  for (const row of data) {
    // Rows are ordered by created_at ascending — first one wins per workspace.
    if (previews.has(row.workspace_id)) continue;
    if (!TEMPLATE_IDS.includes(row.template_id as TemplateId)) continue;

    const draftJson = row.draft_json as { data?: Record<string, unknown> } | null;
    previews.set(row.workspace_id, {
      templateId: row.template_id as TemplateId,
      data: (draftJson?.data ?? {}) as BasePortfolioData,
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
