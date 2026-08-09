import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { listProjects, createProject, getProjectWithDraft, getProjectPublishedVersion, hasProfileDiverged } from "@/lib/projects/store";
import { buildInitialDocument } from "@/templates/definition";
import { getUserProfile } from "@/lib/profile/queries";
import { getDefinition } from "@/templates/registry";
import { Editor } from "@/components/dashboard/Editor";
import { TEMPLATE_IDS, type TemplateId } from "@/templates/types";
import { listContentItems } from "@/lib/content/store";
import { resolveLibraryData } from "@/lib/content/resolve";

const DEFAULT_TEMPLATE: TemplateId = "minimal";

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, workspaceId } = await params;
  const sp = await searchParams;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return redirect({ href: "/dashboard", locale });
  }

  // Get or create the first project for this workspace
  const projects = await listProjects(workspaceId);

  if (projects.length === 0) {
    // First time: create a default project with auto-fill from WorkspaceProfile
    let selectedTemplateId = (sp.templateId as string) || DEFAULT_TEMPLATE;
    if (!TEMPLATE_IDS.includes(selectedTemplateId as TemplateId)) {
      selectedTemplateId = DEFAULT_TEMPLATE;
    }

    const profile = await getUserProfile();
    if (!profile) return redirect({ href: "/login", locale });
    const definition = getDefinition(selectedTemplateId as TemplateId);
    let initialDoc = definition
      ? buildInitialDocument(profile, definition, locale)
      : {
          meta: {
            templateId: selectedTemplateId,
            templateVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            locale,
          },
          data: {},
        };
    const libraryItems = await listContentItems();
    initialDoc = { ...initialDoc, data: resolveLibraryData(initialDoc.data, libraryItems) };

    const created = await createProject(
      workspaceId,
      workspace.name,
      selectedTemplateId,
      initialDoc,
    );

    if (!created) {
      return redirect({ href: "/dashboard", locale });
    }

    return (
      <div className="flex h-full w-full flex-col">
        <Editor
          projectId={created.id}
          workspaceId={workspaceId}
          initialDocument={created.draftVersion.contentJson}
          initialTemplateId={created.templateId as TemplateId}
          initialSubdomain={created.subdomain}
          initialStatus={created.status}
          profileDiverged={false}
          rootDomain={process.env.NEXT_PUBLIC_ROOT_DOMAIN}
        />
      </div>
    );
  }

  // Use the first project (most recent workspaces have one project in MVP)
  const project = projects[0];

  // Fetch full project with its current draft version
  const fullProject = await getProjectWithDraft(project.id);

  if (!fullProject) {
    return redirect({ href: "/dashboard", locale });
  }

  const profileDiverged = await hasProfileDiverged(fullProject.id);

  // Load the last published snapshot (if any) so the editor can show
  // draft-vs-published divergence and allow reverting the draft to live.
  const publishedVersion = await getProjectPublishedVersion(fullProject.id);

  // Validate templateId
  const templateId = TEMPLATE_IDS.includes(fullProject.templateId as TemplateId)
    ? (fullProject.templateId as TemplateId)
    : DEFAULT_TEMPLATE;
  const libraryItems = await listContentItems();
  const resolvedDocument = {
    ...fullProject.draftVersion.contentJson,
    data: resolveLibraryData(fullProject.draftVersion.contentJson.data, libraryItems),
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Editor
        projectId={fullProject.id}
        workspaceId={workspaceId}
        initialDocument={resolvedDocument}
        initialPublishedDocument={publishedVersion?.contentJson ?? null}
        initialTemplateId={templateId}
        initialSubdomain={fullProject.subdomain}
        initialStatus={fullProject.status}
        profileDiverged={profileDiverged}
        rootDomain={process.env.NEXT_PUBLIC_ROOT_DOMAIN}
      />
    </div>
  );
}
