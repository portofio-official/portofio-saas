"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createWorkspaceAction, type CreateWorkspaceState } from "@/lib/workspace/actions";
import { FormField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: CreateWorkspaceState = { error: null };

export function CreateWorkspaceForm() {
  const t = useTranslations("Workspace.create");
  const tErrors = useTranslations("Workspace.errors");
  const [state, formAction] = useActionState(createWorkspaceAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField
        label={t("nameLabel")}
        name="name"
        placeholder={t("namePlaceholder")}
        required
      />
      {state.error && <p className="text-sm text-danger">{tErrors(state.error)}</p>}
      <SubmitButton label={t("submit")} pendingLabel={t("submitPending")} />
    </form>
  );
}
