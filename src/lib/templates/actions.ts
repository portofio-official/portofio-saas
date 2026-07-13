"use server";

import { saveSelectedTemplateId } from "@/lib/templates/store";
import type { TemplateId } from "@/lib/templates/types";

export async function saveTemplateIdAction(
  workspaceId: string,
  templateId: TemplateId,
): Promise<{ ok: boolean }> {
  const ok = await saveSelectedTemplateId(workspaceId, templateId);
  return { ok };
}
