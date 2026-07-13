import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { getPortfolioData } from "@/lib/portfolio/store";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";

export default async function PortfolioDataPage({
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

  const [data, t] = await Promise.all([
    getPortfolioData(workspaceId),
    getTranslations("PortfolioForm"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link
        href={`/dashboard/${workspaceId}`}
        className="mb-8 inline-block text-sm text-ink-soft hover:text-ink"
      >
        ← {t("backToDashboard")}
      </Link>
      <PortfolioForm workspaceId={workspaceId} initialData={data} />
    </div>
  );
}
