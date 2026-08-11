import { createClient } from "@/lib/supabase/server";
import type { TemplateSubmission, TemplateSubmissionInput } from "./types";

function mapRow(row: Record<string, unknown>): TemplateSubmission {
  return {
    id: String(row.id),
    designerId: String(row.designer_id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    previewUrl: String(row.preview_url ?? ""),
    previewMobileUrl: String(row.preview_mobile_url ?? ""),
    sourcePath: (row.source_path as string | null) ?? null,
    sourceFilename: (row.source_filename as string | null) ?? null,
    sourceSizeBytes: (row.source_size_bytes as number | null) ?? null,
    category: (row.category as string | null) ?? null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    licenseName: String(row.license_name ?? ""),
    status: row.status as TemplateSubmission["status"],
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    reviewNotes: (row.review_notes as string | null) ?? null,
    registryId: (row.registry_id as string | null) ?? null,
    integrationStatus: (row.integration_status as TemplateSubmission["integrationStatus"]) ?? "not_started",
    integrationNotes: (row.integration_notes as string | null) ?? null,
    integratedAt: (row.integrated_at as string | null) ?? null,
    submittedAt: (row.submitted_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listTemplateSubmissions(): Promise<TemplateSubmission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("template_submissions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getTemplateSubmission(id: string): Promise<TemplateSubmission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("template_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function createTemplateSubmission(
  input: TemplateSubmissionInput,
): Promise<TemplateSubmission | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("template_submissions")
    .insert({
      designer_id: user.id,
      name: input.name,
      description: input.description,
      preview_url: input.previewUrl,
      preview_mobile_url: input.previewMobileUrl || null,
      category: input.category || null,
      tags: input.tags,
      license_name: input.licenseName,
      status: "draft",
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function updateTemplateSubmission(
  id: string,
  input: TemplateSubmissionInput,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("template_submissions")
    .update({
      name: input.name,
      description: input.description,
      preview_url: input.previewUrl,
      preview_mobile_url: input.previewMobileUrl || null,
      category: input.category || null,
      tags: input.tags,
      license_name: input.licenseName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return !error;
}
