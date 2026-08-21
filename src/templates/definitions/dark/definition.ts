import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { darkSchema, DARK_SECTIONS } from "./schema";

export const DARK_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Terminal",
    colors: {
      primary: "#66FF99",
      background: "#080A09",
      surface: "#101411",
      text: "#E7EEE9",
      textMuted: "#77847B",
      border: "#273029",
    }
  },
  {
    id: "emerald",
    label: "Ultraviolet",
    colors: {
      primary: "#B89CFF",
      background: "#09080D",
      surface: "#121018",
      text: "#EFEAF8",
      textMuted: "#827C8D",
      border: "#2C2735",
    }
  },
  {
    id: "slate",
    label: "Ice",
    colors: {
      primary: "#58D7FF",
      background: "#070B0D",
      surface: "#0E1518",
      text: "#E8F3F6",
      textMuted: "#74858B",
      border: "#243238",
    }
  }
];

import { DARK_DEFAULTS } from "./defaults";
import { mapProfileBase } from "@/templates/shared/_base";
import { DarkRenderer } from "./renderer";

export const darkDefinition: TemplateDefinition<typeof darkSchema> = {
  id: "dark",
  version: 1,
  meta: {
    name: "Dark",
    description: "Dark theme with neon accents. Built for developers and tech professionals.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "skills", "contact"],
    tags: ["dark", "neon", "developer", "tech"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#09090b]",
      categories: ["Developer"],
    },
  },
  variants: DARK_VARIANTS,
  sections: DARK_SECTIONS,
  schema: darkSchema,
  defaults: DARK_DEFAULTS,
  migrations: [],
  mapper: (p) => mapProfileBase(DARK_DEFAULTS, p),
  renderer: DarkRenderer,
};

export default darkDefinition;
