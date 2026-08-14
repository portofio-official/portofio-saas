import { TemplateGallery } from "@/components/dashboard/TemplateGallery";
import { getInUseTemplateIds } from "@/lib/workspace/queries";

export default async function DashboardTemplatesPage() {
  const inUseTemplateIds = await getInUseTemplateIds();
  return <TemplateGallery isLoggedIn embedded inUseTemplateIds={inUseTemplateIds} />;
}
