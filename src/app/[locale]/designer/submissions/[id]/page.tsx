import { redirect } from "@/i18n/navigation";
import { SubmissionForm } from "@/components/designer/SubmissionForm";
import { getTemplateSubmission } from "@/lib/designer/store";

export default async function DesignerSubmissionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const submission = await getTemplateSubmission(id);
  if (!submission) return redirect({ href: "/designer/submissions", locale });
  return <SubmissionForm submission={submission} />;
}
