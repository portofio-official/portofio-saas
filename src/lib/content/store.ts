import { createClient } from "@/lib/supabase/server";
import type { ContentItem, ContentItemInput } from "./types";

// RLS (content_library_owner_all, to authenticated) scopes rows to the
// caller's own workspaces — no manual user_id filter needed.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): ContentItem {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    title: row.title as string,
    description: row.description as string,
    imageUrl: row.image_url as string,
    link: row.link as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listContentItems(workspaceId: string): Promise<ContentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_library")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => mapRow(r as Record<string, unknown>));
}

export async function getContentItem(id: string): Promise<ContentItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_library")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function createContentItem(
  workspaceId: string,
  input: ContentItemInput,
): Promise<ContentItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_library")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      description: input.description,
      image_url: input.imageUrl,
      link: input.link,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function updateContentItem(
  id: string,
  input: ContentItemInput,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("content_library")
    .update({
      title: input.title,
      description: input.description,
      image_url: input.imageUrl,
      link: input.link,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}

export async function deleteContentItem(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("content_library").delete().eq("id", id);
  return !error;
}