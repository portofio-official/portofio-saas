import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { minimalSchema, MINIMAL_SECTIONS } from "./schema";

export const MINIMAL_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Paper",
    colors: {
      primary: "#00cf7c",
      background: "#FAF9F5",
      surface: "#F1EFE7",
      text: "#16150F",
      textMuted: "#75736A",
      border: "#E7E4D9",
      faint: "#A9A697",
    }
  },
  {
    id: "charcoal",
    label: "Charcoal",
    colors: {
      primary: "#10b981",
      background: "#18181b",
      surface: "#27272a",
      text: "#fafafa",
      textMuted: "#a1a1aa",
      border: "#3f3f46",
      faint: "#52525b",
    }
  },
  {
    id: "navy",
    label: "Navy",
    colors: {
      primary: "#3b82f6",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "#334155",
      faint: "#475569",
    }
  }
];
import { MINIMAL_DEFAULTS } from "./defaults";
import { mapProfileToMinimal } from "./mapper";
import { minimalMigrations } from "./migrations";
import { MinimalRenderer } from "./renderer";

export const minimalDefinition: TemplateDefinition<typeof minimalSchema> = {
  id: "minimal",
  version: 1,
  meta: {
    name: "Minimal",
    description: "Clean editorial layout. Warm paper tones, serif typography, one column.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "skills", "contact"],
    tags: ["clean", "editorial", "serif", "light"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#f9f6f1]",
      categories: ["Personal"],
    },
  },
  variants: MINIMAL_VARIANTS,
  sections: MINIMAL_SECTIONS,
  schema: minimalSchema,
  defaults: MINIMAL_DEFAULTS,
  migrations: minimalMigrations,
  mapper: mapProfileToMinimal,
  renderer: MinimalRenderer,
};

export default minimalDefinition;
