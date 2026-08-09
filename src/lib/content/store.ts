import { createClient } from "@/lib/supabase/server";
import type { ContentItem, ContentItemInput } from "./types";

// RLS (content_library_owner_all, to authenticated) scopes rows to the
// caller's account via user_id = auth.uid() — no manual filter needed.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): ContentItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: row.description as string,
    imageUrl: row.image_url as string,
    link: row.link as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    contentType: (row.content_type ?? "project") as ContentItem["contentType"],
    isActive: row.is_active ?? true,
    sortOrder: row.sort_order ?? 0,
    content: (row.content_json ?? {}) as Record<string, unknown>,
  };
}

export async function listContentItems(): Promise<ContentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_library")
    .select("*")
    .order("sort_order", { ascending: true })
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

export async function createContentItem(input: ContentItemInput): Promise<ContentItem | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("content_library")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description,
      image_url: input.imageUrl,
      link: input.link,
      content_type: input.contentType ?? "project",
      is_active: input.isActive ?? true,
      content_json: input.content ?? {},
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
      content_type: input.contentType ?? "project",
      is_active: input.isActive ?? true,
      content_json: input.content ?? {},
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

export async function updateContentItemState(
  id: string,
  isActive: boolean,
  sortOrder: number,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("content_library")
    .update({ is_active: isActive, sort_order: sortOrder, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}