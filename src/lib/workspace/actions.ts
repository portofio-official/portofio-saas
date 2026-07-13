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

  return redirect({ href: `/dashboard/${workspace.id}/data`, locale: await getLocale() });
}
