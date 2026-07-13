import { createClient } from "@/lib/supabase/server";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/templates/types";

const DEFAULT_TEMPLATE_ID: TemplateId = "minimal";

// One row per workspace in the real `sites` table (PRD 9.4). `subdomain` is
// nullable until publish-001 actually publishes it (see migration
// 20260713000002); this only ever touches `template_id`. RLS (sites_owner_all,
// to authenticated) scopes access to workspaces the caller owns.
export async function getSelectedTemplateId(workspaceId: string): Promise<TemplateId> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("template_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) return DEFAULT_TEMPLATE_ID;
  return TEMPLATE_IDS.includes(data.template_id as TemplateId)
    ? (data.template_id as TemplateId)
    : DEFAULT_TEMPLATE_ID;
}

export async function saveSelectedTemplateId(workspaceId: string, templateId: TemplateId): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sites")
    .upsert({ workspace_id: workspaceId, template_id: templateId }, { onConflict: "workspace_id" });

  return !error;
}
