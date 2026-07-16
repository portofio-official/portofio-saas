// ponytail: stub only — UI asset manager is Fase 2+.
// The table exists; this file is the future home of asset CRUD.
import { createClient } from "@/lib/supabase/server";

export interface WorkspaceAsset {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export async function listAssets(workspaceId: string): Promise<WorkspaceAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_assets")
    .select("id, workspace_id, name, url, mime_type, size_bytes, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    name: r.name,
    url: r.url,
    mimeType: r.mime_type ?? null,
    sizeBytes: r.size_bytes ?? null,
    createdAt: r.created_at,
  }));
}
