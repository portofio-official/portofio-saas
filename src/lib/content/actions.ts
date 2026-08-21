"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  listContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  updateContentItemState,
} from "./store";
import { sanitizeString, sniffImage } from "@/lib/utils";
import type { ContentItem, ContentItemInput } from "./types";
import { requireRole } from "@/lib/auth/roles";

const CONTENT_BUCKET = "content";

function sanitizeInput(input: ContentItemInput): ContentItemInput {
  return {
    title: sanitizeString(input.title ?? "").slice(0, 300),
    description: sanitizeString(input.description ?? "").slice(0, 2000),
    imageUrl: sanitizeString(input.imageUrl ?? "").slice(0, 1000),
    link: sanitizeString(input.link ?? "").slice(0, 1000),
    contentType: input.contentType ?? "project",
    isActive: input.isActive ?? true,
    content: input.content ?? {},
  };
}

export async function listContentItemsAction(): Promise<ContentItem[]> {
  await requireRole(["user", "designer"]);
  return listContentItems();
}

export async function getContentItemAction(id: string): Promise<ContentItem | null> {
  await requireRole(["user", "designer"]);
  return getContentItem(id);
}

/** Uploads a compressed image (data:image/... URL) to the user's content
 *  folder in Supabase Storage and returns the public URL. */
export async function uploadContentImageAction(
  dataUrl: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireRole(["user", "designer"]);
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(dataUrl ?? "");
  if (!match) return { ok: false, error: "Invalid image data." };

  const mime = match[1];
  const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength === 0) return { ok: false, error: "Empty file" };
  if (bytes.byteLength > 8 * 1024 * 1024) return { ok: false, error: "tooLarge" };

  // Trust the actual bytes, not the client-declared MIME label: reject
  // anything whose magic bytes / header dimensions don't match a real
  // image of the claimed type (e.g. an HTML/SVG payload renamed to .png).
  const sniffed = sniffImage(bytes);
  if (!sniffed || sniffed.type !== mime.split("/")[1]) {
    return { ok: false, error: "Invalid image data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const path = `${user.id}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(CONTENT_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function createContentItemAction(
  input: ContentItemInput,
): Promise<{ ok: boolean; item?: ContentItem; error?: string }> {
  await requireRole(["user", "designer"]);
  const item = await createContentItem(sanitizeInput(input));
  if (!item) return { ok: false, error: "Failed to save item" };
  return { ok: true, item };
}

export async function updateContentItemAction(
  id: string,
  input: ContentItemInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const ok = await updateContentItem(id, sanitizeInput(input));
  return ok ? { ok: true } : { ok: false, error: "Failed to update item" };
}

export async function deleteContentItemAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["user", "designer"]);
  const ok = await deleteContentItem(id);
  return ok ? { ok: true } : { ok: false, error: "Failed to delete item" };
}

export async function updateContentItemStateAction(
  id: string,
  isActive: boolean,
  sortOrder: number,
): Promise<{ ok: boolean }> {
  await requireRole(["user", "designer"]);
  return { ok: await updateContentItemState(id, isActive, Math.max(0, Math.round(sortOrder))) };
}
