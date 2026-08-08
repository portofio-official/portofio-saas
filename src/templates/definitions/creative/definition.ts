import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { creativeSchema, CREATIVE_SECTIONS } from "./schema";

export const CREATIVE_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Default",
    colors: {
      primary: "#2563eb",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    }
  },
  {
    id: "emerald",
    label: "Emerald",
    colors: {
      primary: "#10b981",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#059669",
      border: "#d1fae5",
    }
  },
  {
    id: "slate",
    label: "Slate",
    colors: {
      primary: "#cbd5e1",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "#334155",
    }
  }
];

import { CREATIVE_DEFAULTS } from "./defaults";
import { mapProfileToCreative } from "./mapper";
import { creativeMigrations } from "./migrations";
import { CreativeRenderer } from "./renderer";

export const creativeDefinition: TemplateDefinition<typeof creativeSchema> = {
  id: "creative",
  version: 1,
  meta: {
    name: "Creative",
    description: "Project grid front and center. Ideal for designers and photographers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "skills", "testimonials", "contact"],
    tags: ["grid", "visual", "design", "photography"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#0f172a]",
      categories: ["Creative", "Portfolio"],
    },
  },
  variants: CREATIVE_VARIANTS,
  sections: CREATIVE_SECTIONS,
  schema: creativeSchema,
  defaults: CREATIVE_DEFAULTS,
  migrations: creativeMigrations,
  mapper: mapProfileToCreative,
  renderer: CreativeRenderer,
};

export default creativeDefinition;
