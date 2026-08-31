/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile, WebsiteDocument } from "./definition";
import { parseDocumentData } from "./definition";

import type { TemplateId } from "./types";
import { TEMPLATE_IDS } from "./types";

import minimalDef from "./definitions/minimal/definition";
import boldDef from "./definitions/bold/definition";
import creativeDef from "./definitions/creative/definition";
import corporateDef from "./definitions/corporate/definition";
import darkDef from "./definitions/dark/definition";
import studioDef from "./definitions/studio/definition";
import portfolioProDef from "./definitions/portfolio-pro/definition";
import freelancerDef from "./definitions/freelancer/definition";

// ─── Auto-register ───────────────────────────────────────────────────────────
// Template sekarang di-import secara manual agar kompatibel dengan Webpack (bukan cuma Turbopack).
// Menambah template = buat folder, tambahkan id di types.ts, dan tambahkan import di file ini.
export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition<z.ZodTypeAny>> = {
  minimal: minimalDef as TemplateDefinition<z.ZodTypeAny>,
  bold: boldDef as TemplateDefinition<z.ZodTypeAny>,
  creative: creativeDef as TemplateDefinition<z.ZodTypeAny>,
  corporate: corporateDef as TemplateDefinition<z.ZodTypeAny>,
  dark: darkDef as TemplateDefinition<z.ZodTypeAny>,
  studio: studioDef as TemplateDefinition<z.ZodTypeAny>,
  "portfolio-pro": portfolioProDef as TemplateDefinition<z.ZodTypeAny>,
  freelancer: freelancerDef as TemplateDefinition<z.ZodTypeAny>,
};

// ─── Single source of truth untuk galeri ────────────────────────────────────
// Semua metadata tampilan (name, description, tags, accentBg, popular) dibaca
// dari definition.meta.gallery tiap template. Dua komponen galeri
// (TemplateGallery, TemplateShowcase) hanya mengonsumsi TEMPLATE_CATALOG —
// TIDAK boleh mendefinisikan list template sendiri.

export interface TemplateCatalogItem {
  id: TemplateId;
  name: string;
  description: string;
  tags: string[]; // display tags, includes "All"
  accentBg: string;
  popular?: boolean;
}

export const TEMPLATE_CATALOG: TemplateCatalogItem[] = TEMPLATE_IDS.flatMap((id) => {
  const definition = TEMPLATE_REGISTRY[id];
  const gallery = definition?.meta.gallery;
  if (!gallery) return [];
  return [
    {
      id,
      name: definition.meta.name,
      description: definition.meta.description,
      tags: ["All", ...gallery.categories],
      accentBg: gallery.accentBg,
      popular: gallery.popular,
    },
  ];
});

export const TEMPLATE_CATEGORIES: string[] = [
  "All",
  "Personal",
  "Creative",
  "Portfolio",
  "Professional",
  "Developer",
];

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

  return <Renderer data={safeData as any} />;
}