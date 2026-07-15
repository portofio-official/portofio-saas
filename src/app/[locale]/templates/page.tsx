import { getCurrentUserEmail } from "@/lib/auth/session";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const email = await getCurrentUserEmail();

  return <TemplateGallery isLoggedIn={!!email} />;
}
