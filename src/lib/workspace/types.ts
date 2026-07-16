import type { TemplateId } from "@/lib/templates/types";
import type { BasePortfolioData } from "@/lib/templates/schemas/_base";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  // Populated by listWorkspaces() for a dashboard card thumbnail; omitted
  // elsewhere (e.g. getWorkspace()), where nothing needs to render a preview.
  preview?: { templateId: TemplateId; data: BasePortfolioData } | null;
}
