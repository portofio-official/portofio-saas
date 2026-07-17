// Template registry — Zod-based TemplateDefinition system.
// ponytail: TEMPLATE_COMPONENTS and old TemplateRenderer kept for backward-compat
// with Editor.tsx until it's migrated to use WebsiteDocument. Remove after Fase 3.
import type { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile, WebsiteDocument } from "@/lib/templates/definition";
import { parseDocumentData } from "@/lib/templates/definition";
import { minimalDefinition } from "@/components/templates/minimal/schema";
import { boldDefinition } from "@/components/templates/bold/schema";
import { creativeDefinition } from "@/components/templates/creative/schema";
import { corporateDefinition } from "@/components/templates/corporate/schema";
import { darkDefinition } from "@/components/templates/dark/schema";
import { studioDefinition } from "@/components/templates/studio/schema";
import { portfolioProDefinition } from "@/components/templates/portfolio-pro/schema";

import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";
import type { TemplateId } from "@/lib/templates/types";
import { MinimalTemplate } from "@/components/templates/minimal/Template";
import { BoldTemplate } from "@/components/templates/bold/Template";
import { CreativeTemplate } from "@/components/templates/creative/Template";
import { CorporateTemplate } from "@/components/templates/corporate/Template";
import { DarkTemplate } from "@/components/templates/dark/Template";
import { StudioTemplate } from "@/components/templates/studio/Template";
import { PortfolioProTemplate } from "@/components/templates/portfolio-pro/Template";

// ── New registry ────────────────────────────────────────────────────────────

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

// New renderer — accepts WebsiteDocument + WorkspaceProfile
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

// ── Legacy — backward-compat until Editor is migrated (Fase 3) ─────────────
// ponytail: delete these after Editor.tsx switches to WebsiteDocument

export const TEMPLATE_COMPONENTS: Record<TemplateId, React.ComponentType<{ data: PortfolioData }>> = {
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  creative: CreativeTemplate,
  corporate: CorporateTemplate,
  dark: DarkTemplate,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  studio: StudioTemplate as any, // Cast to any because legacy expects BasePortfolioData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "portfolio-pro": PortfolioProTemplate as any, // Cast to any because legacy expects BasePortfolioData
};

/** @deprecated Use TemplateRenderer with WebsiteDocument instead */
export function LegacyTemplateRenderer({ templateId, data }: { templateId: TemplateId; data: PortfolioData }) {
  const Template = TEMPLATE_COMPONENTS[templateId];
  return <Template data={data} />;
}
