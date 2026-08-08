import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { boldSchema, BOLD_SECTIONS } from "./schema";

export const BOLD_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Yellow",
    colors: {
      primary: "#facc15",
      background: "#fafafa",
      surface: "#f4f4f5",
      text: "#09090b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    }
  },
  {
    id: "midnight",
    label: "Midnight",
    colors: {
      primary: "#38bdf8",
      background: "#020617",
      surface: "#0f172a",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "#1e293b",
    }
  },
  {
    id: "cherry",
    label: "Cherry",
    colors: {
      primary: "#f43f5e",
      background: "#fff1f2",
      surface: "#ffe4e6",
      text: "#4c0519",
      textMuted: "#9f1239",
      border: "#fecdd3",
    }
  }
];
import { BOLD_DEFAULTS } from "./defaults";
import { mapProfileToBold } from "./mapper";
import { boldMigrations } from "./migrations";
import { BoldRenderer } from "./renderer";

export const boldDefinition: TemplateDefinition<typeof boldSchema> = {
  id: "bold",
  version: 1,
  meta: {
    name: "Bold",
    description: "Strong accent colors, large headings. Built for creatives and marketers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "skills", "contact"],
    tags: ["bold", "colorful", "creative", "marketing"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#1a1a2e]",
      categories: ["Creative"],
    },
  },
  variants: BOLD_VARIANTS,
  sections: BOLD_SECTIONS,
  schema: boldSchema,
  defaults: BOLD_DEFAULTS,
  migrations: boldMigrations,
  mapper: mapProfileToBold,
  renderer: BoldRenderer,
};

export default boldDefinition;
