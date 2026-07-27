import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Reversible Soft-Unpublish: Sets status = 'draft' for all projects belonging to the user's workspaces.
 * Preserves published_json and draft_json untouched so user data is never lost.
 */
export async function softUnpublishUserProjects(userId: string): Promise<{ success: boolean; unpublishedCount: number; error?: string }> {
  try {
    const supabase = createAdminClient();

    // 1. Fetch user's workspaces
    const { data: workspaces, error: wsError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("user_id", userId);

    if (wsError || !workspaces || workspaces.length === 0) {
      return { success: true, unpublishedCount: 0 };
    }

    const workspaceIds = workspaces.map((w) => w.id);

    // 2. Soft-unpublish all published projects in those workspaces
    const { data: updatedProjects, error: updateError } = await supabase
      .from("projects")
      .update({
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .in("workspace_id", workspaceIds)
      .eq("status", "published")
      .select("id");

    if (updateError) {
      console.error("[SoftUnpublish] Failed to update projects status:", updateError);
      return { success: false, unpublishedCount: 0, error: updateError.message };
    }

    const count = updatedProjects ? updatedProjects.length : 0;
    console.log(`[SoftUnpublish] Successfully soft-unpublished ${count} project(s) for user ${userId}`);

    return { success: true, unpublishedCount: count };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[SoftUnpublish] Unexpected error during soft-unpublish:", errorMsg);
    return { success: false, unpublishedCount: 0, error: errorMsg };
  }
}
