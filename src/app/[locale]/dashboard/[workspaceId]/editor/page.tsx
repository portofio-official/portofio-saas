import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/workspace/queries";
import { listProjects, createProject } from "@/lib/projects/store";
import { buildInitialDocument } from "@/lib/templates/definition";
import { getWorkspaceProfile } from "@/lib/workspace/profile";
import { getDefinition } from "@/components/templates/registry";
import { Editor } from "@/components/dashboard/Editor";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/templates/types";

const DEFAULT_TEMPLATE: TemplateId = "minimal";

export default async function EditorPage({
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

  // Get or create the first project for this workspace
  const projects = await listProjects(workspaceId);

  if (projects.length === 0) {
    // First time: create a default project with auto-fill from WorkspaceProfile
    const profile = await getWorkspaceProfile(workspaceId);
    const definition = getDefinition(DEFAULT_TEMPLATE);
    const initialDoc = definition
      ? buildInitialDocument(profile, definition, locale)
      : {
          meta: {
            templateId: DEFAULT_TEMPLATE,
            templateVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            locale,
          },
          data: {},
        };

    const created = await createProject(
      workspaceId,
      workspace.name,
      DEFAULT_TEMPLATE,
      initialDoc,
    );

    if (!created) {
      return redirect({ href: "/dashboard", locale });
    }

    return (
      <div className="mx-auto max-w-[90rem] px-4 py-8 md:px-8 md:py-12">
        <a
          href={`/${locale}/dashboard/${workspaceId}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to templates
        </a>
        <Editor
          projectId={created.id}
          initialDocument={created.draftJson}
          initialTemplateId={created.templateId as TemplateId}
        />
      </div>
    );
  }

  // Use the first project (most recent workspaces have one project in MVP)
  const project = projects[0];

  // Fetch full project data (summary doesn't include draft_json)
  const { getProject } = await import("@/lib/projects/store");
  const fullProject = await getProject(project.id);

  if (!fullProject) {
    return redirect({ href: "/dashboard", locale });
  }

  // Validate templateId
  const templateId = TEMPLATE_IDS.includes(fullProject.templateId as TemplateId)
    ? (fullProject.templateId as TemplateId)
    : DEFAULT_TEMPLATE;

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 md:px-8 md:py-12">
      <a
        href={`/${locale}/dashboard/${workspaceId}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to templates
      </a>
      <Editor
        projectId={fullProject.id}
        initialDocument={fullProject.draftJson}
        initialTemplateId={templateId}
      />
    </div>
  );
}
