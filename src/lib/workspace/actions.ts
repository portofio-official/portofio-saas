"use server";

import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

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

  if (templateId) {
    const { saveTemplateIdAction } = await import("@/lib/templates/actions");
    await saveTemplateIdAction(workspace.id, templateId as any);
  }

  return redirect({ href: `/dashboard/${workspace.id}/editor`, locale: await getLocale() });
}
