import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { getPortfolioData } from "@/lib/portfolio/store";
import { getSelectedTemplateId } from "@/lib/templates/store";
import { Editor } from "@/components/dashboard/Editor";

export default async function EditorPage({
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

  const [data, templateId] = await Promise.all([
    getPortfolioData(workspaceId),
    getSelectedTemplateId(workspaceId),
  ]);

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 md:px-8 md:py-12">
      <a
        href={`/${locale}/dashboard/${workspaceId}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to templates
      </a>
      <Editor workspaceId={workspaceId} initialData={data} initialTemplateId={templateId} />
    </div>
  );
}
