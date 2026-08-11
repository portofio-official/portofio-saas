import { DesignerDashboard } from "@/components/designer/DesignerDashboard";
import { listTemplateSubmissions } from "@/lib/designer/store";

export default async function DesignerPage() {
  const submissions = await listTemplateSubmissions();
  return <DesignerDashboard submissions={submissions} />;
}
