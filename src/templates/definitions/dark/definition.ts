import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { darkSchema, DARK_SECTIONS } from "./schema";

export const DARK_VARIANTS: TemplateVariant[] = [
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

import { DARK_DEFAULTS } from "./defaults";
import { mapProfileToDark } from "./mapper";
import { darkMigrations } from "./migrations";
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
  },
  variants: DARK_VARIANTS,
  sections: DARK_SECTIONS,
  schema: darkSchema,
  defaults: DARK_DEFAULTS,
  migrations: darkMigrations,
  mapper: mapProfileToDark,
  renderer: DarkRenderer,
};
