/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile, WebsiteDocument } from "./definition";
import { parseDocumentData } from "./definition";

import type { TemplateId } from "./types";
import { TEMPLATE_IDS } from "./types";

// ─── Auto-register ───────────────────────────────────────────────────────────
// Setiap folder di bawah definitions/<id>/ yang mengekspor definitinya sebagai
// default export otomatis terdaftar. Menambah template = cukup buat folder +
// tambahkan id di types.ts — registry TIDAK perlu diedit.
// Butuh Next >= 16.3 (Turbopack); lihat docs/TEMPLATE_AUTHORING.md.
const definitionModules: Record<string, unknown> = import.meta.glob(
  "./definitions/*/definition.ts",
  { eager: true, import: "default" },
);

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition<z.ZodTypeAny>> = Object.fromEntries(
  Object.entries(definitionModules).map(([path, definition]) => {
    const id = path.split("/").slice(-2, -1)[0];
    return [id, definition as TemplateDefinition<z.ZodTypeAny>];
  }),
);

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