import { createClient } from "@/lib/supabase/server";
import type { WorkspaceProfile } from "@/lib/templates/definition";

const EMPTY_EXTENDED: WorkspaceProfile["extendedData"] = {};

export async function getWorkspaceProfile(workspaceId: string): Promise<WorkspaceProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_profile")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    return {
      workspaceId,
      name: null,
      logoUrl: null,
      email: null,
      phone: null,
      address: null,
      websiteUrl: null,
      extendedData: EMPTY_EXTENDED,
    };
  }

  return {
    workspaceId,
    name: data.name ?? null,
    logoUrl: data.logo_url ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    websiteUrl: data.website_url ?? null,
    extendedData: (data.extended_data as WorkspaceProfile["extendedData"]) ?? EMPTY_EXTENDED,
  };
}

export async function saveWorkspaceProfile(
  workspaceId: string,
  profile: Partial<Omit<WorkspaceProfile, "workspaceId">>,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_profile").upsert({
    workspace_id: workspaceId,
    name: profile.name ?? null,
    logo_url: profile.logoUrl ?? null,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    address: profile.address ?? null,
    website_url: profile.websiteUrl ?? null,
    extended_data: profile.extendedData ?? {},
    updated_at: new Date().toISOString(),
  });
  return !error;
}
