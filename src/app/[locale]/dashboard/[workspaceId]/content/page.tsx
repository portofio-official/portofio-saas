import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { listContentItems } from "@/lib/content/store";
import { ContentLibrary } from "@/components/content/ContentLibrary";

export default async function WorkspaceContentPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return redirect({ href: "/dashboard", locale });
  }

  const items = await listContentItems(workspaceId);

  return (
    <ContentLibrary
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      initialItems={items}
    />
  );
}