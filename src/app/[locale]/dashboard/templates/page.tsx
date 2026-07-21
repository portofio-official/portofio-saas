import { TemplateGallery } from "@/components/dashboard/TemplateGallery";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardTemplatesPage() {
  const supabase = await createClient();
  const { data: activeTemplates } = await supabase
    .from("templates")
    .select("id")
    .eq("is_active", true);

  const activeTemplateIds = activeTemplates?.map((t) => t.id) || [];

  return <TemplateGallery isLoggedIn embedded activeTemplateIds={activeTemplateIds} />;
}
