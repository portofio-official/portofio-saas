"use server";

import { getCurrentUserEmail } from "@/lib/auth/session";
import { saveSelectedTemplateId } from "@/lib/templates/store";
import type { TemplateId } from "@/lib/templates/types";

export async function saveTemplateIdAction(templateId: TemplateId): Promise<{ ok: boolean }> {
  const email = await getCurrentUserEmail();
  if (!email) return { ok: false };

  await saveSelectedTemplateId(email, templateId);
  return { ok: true };
}
