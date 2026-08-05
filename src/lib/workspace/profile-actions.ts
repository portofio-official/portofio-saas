"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { saveWorkspaceProfile } from "@/lib/workspace/profile";
import { WorkspaceProfileSchema } from "@/lib/workspace/schemas";

export type WorkspaceProfileActionState = { error: string | null };

export async function updateWorkspaceProfileAction(
  workspaceId: string,
  _prevState: WorkspaceProfileActionState,
  formData: FormData,
): Promise<WorkspaceProfileActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();

  // Validate using Zod
  const result = WorkspaceProfileSchema.safeParse({ email, phone, address, websiteUrl });
  
  if (!result.success) {
    // Just return generic validation error or map from zod
    return { error: "validationError" };
  }

  const success = await saveWorkspaceProfile(workspaceId, {
    email: email || null,
    phone: phone || null,
    address: address || null,
    websiteUrl: websiteUrl || null,
  });

  if (!success) {
    return { error: "generic" };
  }

  return redirect({ href: `/dashboard/${workspaceId}/editor`, locale: await getLocale() });
}
