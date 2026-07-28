import type { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile, WebsiteDocument } from "./definition";
import { parseDocumentData } from "./definition";

import { minimalDefinition } from "./definitions/minimal/definition";
import { boldDefinition } from "./definitions/bold/definition";
import { creativeDefinition } from "./definitions/creative/definition";
import { corporateDefinition } from "./definitions/corporate/definition";
import { darkDefinition } from "./definitions/dark/definition";
import { studioDefinition } from "./definitions/studio/definition";
import { portfolioProDefinition } from "./definitions/portfolio-pro/definition";

import type { BasePortfolioData as PortfolioData } from "./shared/_base";
import type { TemplateId } from "./types";

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition<z.ZodTypeAny>> = {
  minimal: minimalDefinition,
  bold: boldDefinition,
  creative: creativeDefinition,
  corporate: corporateDefinition,
  dark: darkDefinition,
  studio: studioDefinition,
  "portfolio-pro": portfolioProDefinition,
};

export function getDefinition(templateId: string): TemplateDefinition<z.ZodTypeAny> | null {
  return TEMPLATE_REGISTRY[templateId] ?? null;
}

export function TemplateRenderer({
  templateId,
  document,
  workspaceProfile,
}: {
  templateId: string;
  document: WebsiteDocument;
  workspaceProfile: WorkspaceProfile;
}) {
  const definition = getDefinition(templateId);
  if (!definition) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-gray-400">
        Template &quot;{templateId}&quot; not found.
      </div>
    );
  }
  const data = parseDocumentData(document, definition);
  const Renderer = definition.renderer;
  return <Renderer data={data} workspaceProfile={workspaceProfile} />;
}

export function PreviewTemplateRenderer({ templateId, data }: { templateId: TemplateId; data: unknown }) {
  const definition = getDefinition(templateId);
  if (!definition) return null;

  const parsedResult = definition.schema.safeParse(data ?? {});
  const safeData = parsedResult.success ? parsedResult.data : definition.defaults;
  const Renderer = definition.renderer;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Renderer data={safeData as any} />;
}
