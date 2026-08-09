import { redirect } from "@/i18n/navigation";

export default async function WorkspaceContentPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale } = await params;
  // Content Library is account-global; the old per-workspace URL just redirects.
  return redirect({ href: "/dashboard/content", locale });
}