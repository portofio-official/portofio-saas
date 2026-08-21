import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { creativeSchema, CREATIVE_SECTIONS } from "./schema";

export const CREATIVE_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Studio",
    colors: {
      primary: "#ff4d3d",
      background: "#faf8f4",
      surface: "#ffffff",
      text: "#141414",
      textMuted: "#6b6b6b",
      border: "#e5e1d9",
      faint: "#a8a29a",
    }
  },
  {
    id: "emerald",
    label: "Emerald",
    colors: {
      primary: "#0f9d78",
      background: "#ffffff",
      surface: "#f1faf6",
      text: "#0c3328",
      textMuted: "#3f6e5e",
      border: "#cfe8dd",
      faint: "#7aa494",
    }
  },
  {
    id: "slate",
    label: "Midnight",
    colors: {
      primary: "#ff5c3c",
      background: "#0f1220",
      surface: "#191d31",
      text: "#f5f6fa",
      textMuted: "#9aa2bf",
      border: "#2a2f4d",
      faint: "#565d80",
    }
  }
];

import { CREATIVE_DEFAULTS } from "./defaults";
import { mapProfileBase } from "@/templates/shared/_base";
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
  migrations: [],
  mapper: (p) => mapProfileBase(CREATIVE_DEFAULTS, p),
  renderer: CreativeRenderer,
};

export default creativeDefinition;
