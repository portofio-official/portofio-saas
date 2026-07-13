import { createClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/workspace/types";

// RLS (workspaces_owner_all, to authenticated) already scopes these to the
// caller's own workspaces — no manual user_id filter needed.
export async function listWorkspaces(): Promise<Workspace[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map((w) => ({ id: w.id, name: w.name, createdAt: w.created_at }));
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
