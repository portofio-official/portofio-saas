import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getPortfolioData } from "@/lib/portfolio/store";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";

export default async function PortfolioDataPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const [data, t] = await Promise.all([
    getPortfolioData(email),
    getTranslations("PortfolioForm"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link href="/dashboard" className="mb-8 inline-block text-sm text-ink-soft hover:text-ink">
        ← {t("backToDashboard")}
      </Link>
      <PortfolioForm initialData={data} />
    </div>
  );
}
