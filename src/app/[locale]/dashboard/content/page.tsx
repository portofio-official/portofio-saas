import { redirect } from "@/i18n/navigation";

export default async function DashboardContentHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return redirect({ href: "/dashboard/content/projects", locale });
}