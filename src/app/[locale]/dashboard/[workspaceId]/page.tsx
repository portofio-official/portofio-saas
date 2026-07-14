import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { getPortfolioData } from "@/lib/portfolio/store";
import { getSelectedTemplateId } from "@/lib/templates/store";
import { Editor } from "@/components/dashboard/Editor";

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

  const [data, templateId, t] = await Promise.all([
    getPortfolioData(workspaceId),
    getSelectedTemplateId(workspaceId),
    getTranslations("TemplatePicker"),
  ]);

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 md:px-8 md:py-12">
      <Link
        href="/dashboard"
        className="mb-8 inline-block text-sm text-ink-soft hover:text-ink"
      >
        &larr; {t("backToDashboard")}
      </Link>
      <Editor workspaceId={workspaceId} initialData={data} initialTemplateId={templateId} />
    </div>
  );
}
