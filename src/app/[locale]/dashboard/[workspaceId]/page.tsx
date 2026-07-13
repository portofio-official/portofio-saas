import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { AuthCard } from "@/components/auth/AuthCard";
import { CtaButton } from "@/components/ui/CtaButton";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("Workspace.hub");

  return (
    <AuthCard eyebrow={t("eyebrow")} title={workspace.name} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-4">
        <CtaButton label={t("editData")} href={`/dashboard/${workspaceId}/data`} />
        <CtaButton
          label={t("chooseTemplate")}
          href={`/dashboard/${workspaceId}/template`}
          variant="secondary"
        />
      </div>
    </AuthCard>
  );
}
