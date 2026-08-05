import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { WorkspaceProfileForm } from "@/components/workspace/WorkspaceProfileForm";

export default async function WorkspaceSetupPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
  searchParams: Promise<{ templateId?: string }>;
}) {
  const { locale, workspaceId } = await params;
  const { templateId } = await searchParams;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  return (
    <AuthSplitLayout
      leftTitle={
        <>
          Set Up Your,<br />
          <span className="highlight" style={{ color: "var(--accent)", fontWeight: 300, fontStyle: "italic" }}>
            Workspace
          </span> Profile.
        </>
      }
      leftSubtitle="Provide contact details for your business or personal brand. This information will be available to your website visitors."
      mobileTitle="Workspace Setup"
      formTitle="Workspace Profile"
      formSubtitle="You can always update these details later in your dashboard settings."
    >
      <WorkspaceProfileForm workspaceId={workspaceId} templateId={templateId} />
    </AuthSplitLayout>
  );
}
