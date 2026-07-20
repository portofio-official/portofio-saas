"use server";

import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { listProjects, unpublishProject } from "@/lib/projects/store";

export type CreateWorkspaceState = { error: string | null };

export async function createWorkspaceAction(
  _prevState: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("templateId") ?? "").trim();
  if (!name) return { error: "nameRequired" };

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
  const projects = await listProjects(workspaceId);
  if (!projects[0]) return { ok: false };
  const ok = await unpublishProject(projects[0].id);
  return { ok };
}
