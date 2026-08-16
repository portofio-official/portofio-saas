"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { sanitizeString } from "@/lib/utils";
import {
  createTemplateSubmission,
  getTemplateSubmission,
  updateTemplateSubmission,
} from "./store";
import type { TemplateSubmission, TemplateSubmissionInput } from "./types";

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const ALLOWED_CATEGORIES = ["minimal", "creative", "corporate", "developer", "agency", "other"] as const;

function normalizeInput(input: TemplateSubmissionInput): TemplateSubmissionInput {
  return {
    name: sanitizeString(input.name ?? "").slice(0, 80),
    description: sanitizeString(input.description ?? "").slice(0, 1000),
    previewUrl: sanitizeString(input.previewUrl ?? "").slice(0, 1000),
    previewMobileUrl: sanitizeString(input.previewMobileUrl ?? "").slice(0, 1000),
    category: ALLOWED_CATEGORIES.includes(input.category as (typeof ALLOWED_CATEGORIES)[number]) ? input.category : "other",
    tags: (input.tags ?? []).map((tag) => sanitizeString(tag).slice(0, 30)).filter(Boolean).slice(0, 8),
    licenseName: sanitizeString(input.licenseName ?? "").slice(0, 120),
  };
}

function validateInput(input: TemplateSubmissionInput, strict = false): string | null {
  if (input.name.length < 3) return "nameRequired";
  if (!strict) return null;
  if (input.description.length < 20) return "descriptionRequired";
  if (!input.previewUrl) return "previewRequired";
  if (!input.licenseName) return "licenseRequired";
  try {
    new URL(input.previewUrl);
    if (input.previewMobileUrl) new URL(input.previewMobileUrl);
  } catch {
    return "invalidUrl";
  }
  return null;
}

export async function createTemplateSubmissionAction(
  input: TemplateSubmissionInput,
): Promise<{ ok: boolean; submission?: TemplateSubmission; error?: string }> {
  await requireRole(["designer"]);
  const normalized = normalizeInput(input);
  const error = validateInput(normalized);
  if (error) return { ok: false, error };

  const submission = await createTemplateSubmission(normalized);
  if (submission) revalidatePath("/[locale]/designer", "layout");
  return submission ? { ok: true, submission } : { ok: false, error: "saveFailed" };
}

export async function updateTemplateSubmissionAction(
  id: string,
  input: TemplateSubmissionInput,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["designer"]);
  const existing = await getTemplateSubmission(id);
  if (!existing) return { ok: false, error: "notFound" };
  if (!(["draft", "revision_requested"] as string[]).includes(existing.status)) {
    return { ok: false, error: "locked" };
  }

  const normalized = normalizeInput(input);
  const error = validateInput(normalized);
  if (error) return { ok: false, error };
  const updated = await updateTemplateSubmission(id, normalized);
  if (updated) revalidatePath("/[locale]/designer", "layout");
  return updated
    ? { ok: true }
    : { ok: false, error: "saveFailed" };
}

export async function submitTemplateSubmissionAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["designer"]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const existing = await getTemplateSubmission(id);
  if (!existing || existing.designerId !== user.id) return { ok: false, error: "notFound" };
  if (!(["draft", "revision_requested"] as string[]).includes(existing.status)) {
    return { ok: false, error: "locked" };
  }
  const completeError = validateInput({
    name: existing.name,
    description: existing.description,
    previewUrl: existing.previewUrl,
    previewMobileUrl: existing.previewMobileUrl,
    category: existing.category ?? "other",
    tags: existing.tags,
    licenseName: existing.licenseName,
  }, true);
  if (completeError) return { ok: false, error: completeError };
  if (!existing.sourcePath) return { ok: false, error: "sourceRequired" };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("template_submissions")
    .update({ status: "pending", submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("designer_id", user.id);

  if (error) return { ok: false, error: "submitFailed" };
  revalidatePath("/[locale]/designer", "layout");
  revalidatePath("/[locale]/admin/templates", "page");
  return { ok: true };
}

export async function uploadTemplateSourceAction(
  submissionId: string,
  file: File,
): Promise<{ ok: boolean; error?: string; filename?: string }> {
  await requireRole(["designer"]);
  const existing = await getTemplateSubmission(submissionId);
  if (!existing || !(["draft", "revision_requested"] as string[]).includes(existing.status)) {
    return { ok: false, error: "locked" };
  }

  const filename = file.name.trim();
  const isZip = filename.toLowerCase().endsWith(".zip") &&
    ["application/zip", "application/x-zip-compressed", "application/octet-stream"].includes(file.type || "application/zip");
  if (!isZip) return { ok: false, error: "zipOnly" };
  if (file.size <= 0 || file.size > MAX_SOURCE_BYTES) return { ok: false, error: "sourceTooLarge" };
  const bytes = Buffer.from(await file.arrayBuffer());
  const zipSignature = bytes.subarray(0, 4).toString("hex");
  if (!["504b0304", "504b0506", "504b0708"].includes(zipSignature)) {
    return { ok: false, error: "invalidZip" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const path = `${user.id}/${submissionId}/${randomUUID()}.zip`;
  const { error: uploadError } = await supabase.storage
    .from("template-submissions")
    .upload(path, bytes, {
      contentType: "application/zip",
      upsert: false,
    });
  if (uploadError) return { ok: false, error: "uploadFailed" };

  const { error: updateError } = await supabase
    .from("template_submissions")
    .update({ source_path: path, source_filename: filename, source_size_bytes: file.size })
    .eq("id", submissionId);

  if (updateError) {
    await supabase.storage.from("template-submissions").remove([path]);
    return { ok: false, error: "saveFailed" };
  }
  revalidatePath("/[locale]/designer", "layout");
  return { ok: true, filename };
}
