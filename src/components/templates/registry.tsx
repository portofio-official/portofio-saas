// Template registry — Zod-based TemplateDefinition system.
// ponytail: TEMPLATE_COMPONENTS and old TemplateRenderer kept for backward-compat
// with Editor.tsx until it's migrated to use WebsiteDocument. Remove after Fase 3.
import type { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile, WebsiteDocument } from "@/lib/templates/definition";
import { parseDocumentData } from "@/lib/templates/definition";
import { minimalDefinition } from "@/lib/templates/schemas/minimal";
import { boldDefinition } from "@/lib/templates/schemas/bold";
import { creativeDefinition } from "@/lib/templates/schemas/creative";
import { corporateDefinition } from "@/lib/templates/schemas/corporate";
import { darkDefinition } from "@/lib/templates/schemas/dark";

import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";
import type { TemplateId } from "@/lib/templates/types";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { BoldTemplate } from "@/components/templates/BoldTemplate";
import { CreativeTemplate } from "@/components/templates/CreativeTemplate";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import { DarkTemplate } from "@/components/templates/DarkTemplate";

// ── New registry ────────────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition<z.ZodTypeAny>> = {
  minimal: minimalDefinition,
  bold: boldDefinition,
  creative: creativeDefinition,
  corporate: corporateDefinition,
  dark: darkDefinition,
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
};

/** @deprecated Use TemplateRenderer with WebsiteDocument instead */
export function LegacyTemplateRenderer({ templateId, data }: { templateId: TemplateId; data: PortfolioData }) {
  const Template = TEMPLATE_COMPONENTS[templateId];
  return <Template data={data} />;
}
