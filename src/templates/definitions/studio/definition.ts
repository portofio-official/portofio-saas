import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { studioSchema, STUDIO_SECTIONS } from "./schema";

export const STUDIO_VARIANTS: TemplateVariant[] = [
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

import { STUDIO_DEFAULTS } from "./defaults";
import { mapProfileToStudio } from "./mapper";
import { studioMigrations } from "./migrations";
import { StudioRenderer } from "./renderer";

export const studioDefinition: TemplateDefinition<typeof studioSchema> = {
  id: "studio",
  version: 1,
  meta: {
    name: "Vanguard Studio",
    description: "Agency-tier design with asymmetrical bento grids, ethereal glass textures, and fluid motion.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact", "hero", "expertise", "testimonials"],
    tags: ["agency", "dark", "bento", "premium", "glass"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#050505]",
      categories: ["Creative", "Portfolio"],
      popular: true,
    },
  },
  variants: STUDIO_VARIANTS,
  sections: STUDIO_SECTIONS,
  schema: studioSchema,
  defaults: STUDIO_DEFAULTS,
  migrations: studioMigrations,
  mapper: mapProfileToStudio,
  renderer: StudioRenderer,
};

export default studioDefinition;
