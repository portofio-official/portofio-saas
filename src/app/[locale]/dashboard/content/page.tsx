import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listContentItems } from "@/lib/content/store";
import { ContentLibrary } from "@/components/content/ContentLibrary";

export default async function DashboardContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();
  void getTranslations("ContentLibrary");

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const items = await listContentItems();

  return <ContentLibrary initialItems={items} />;
}