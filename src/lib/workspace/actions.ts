"use server";

import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { listProjects, unpublishProject } from "@/lib/projects/store";
import { requireRole } from "@/lib/auth/roles";

export type CreateWorkspaceState = { error: string | null };

export async function createWorkspaceAction(
  _prevState: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  await requireRole(["user", "designer"]);
  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("templateId") ?? "").trim();
  if (!name) return { error: "nameRequired" };
  if (name.length > 50) return { error: "nameTooLong" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notAuthenticated" };

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  if (error || !workspace) return { error: "generic" };

  let href = `/dashboard/${workspace.id}/editor`;
  if (templateId) {
    href += `?templateId=${templateId}`;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("preferredTemplateId");

  return redirect({ href, locale: await getLocale() });
}

export async function deleteWorkspaceAction(workspaceId: string): Promise<{ error: string | null }> {
  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notAuthenticated" };

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("user_id", user.id); // RLS also enforces ownership

  if (error) return { error: "generic" };

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/[locale]/dashboard", "page");

  return { error: null };
}

/** Finds the first project for a workspace and unpublishes it (for dashboard card action). */
export async function unpublishWorkspaceProjectAction(
  workspaceId: string,
): Promise<{ ok: boolean }> {
  await requireRole(["user", "designer"]);
  const projects = await listProjects(workspaceId);
  if (!projects[0]) return { ok: false };
  const ok = await unpublishProject(projects[0].id);
  return { ok };
}

/** Clones a workspace and its primary project content */
export async function duplicateWorkspaceAction(
  workspaceId: string,
): Promise<{ error: string | null; id?: string }> {
  await requireRole(["user", "designer"]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notAuthenticated" };

  // Fetch target workspace
  const { data: originalWorkspace, error: wsError } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (wsError || !originalWorkspace) return { error: "workspaceNotFound" };

  // Create new workspace
  const copyName = `${originalWorkspace.name} (Copy)`;
  const { data: newWorkspace, error: createError } = await supabase
    .from("workspaces")
    .insert({ user_id: user.id, name: copyName })
    .select("id")
    .single();

  if (createError || !newWorkspace) return { error: "failedToDuplicate" };

  // Clone project if exists
  const projects = await listProjects(workspaceId);
  if (projects[0]) {
    const { getProjectWithDraft, createProject } = await import("@/lib/projects/store");
    const originalProject = await getProjectWithDraft(projects[0].id);
    if (originalProject?.draftVersion) {
      await createProject(
        newWorkspace.id,
        originalProject.name,
        originalProject.templateId,
        originalProject.draftVersion.contentJson,
      );
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/[locale]/dashboard", "page");

  return { error: null, id: newWorkspace.id };
}
