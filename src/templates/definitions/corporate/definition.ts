import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { corporateSchema, CORPORATE_SECTIONS } from "./schema";

export const CORPORATE_VARIANTS: TemplateVariant[] = [
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

import { CORPORATE_DEFAULTS } from "./defaults";
import { mapProfileToCorporate } from "./mapper";
import { corporateMigrations } from "./migrations";
import { CorporateRenderer } from "./renderer";

export const corporateDefinition: TemplateDefinition<typeof corporateSchema> = {
  id: "corporate",
  version: 1,
  meta: {
    name: "Corporate",
    description: "Structured and formal, experience timeline prominent. For job seekers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["experience", "education", "skills", "pricing", "contact"],
    tags: ["formal", "timeline", "job-seeker", "professional"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#f0f4ff]",
      categories: ["Professional"],
    },
  },
  variants: CORPORATE_VARIANTS,
  sections: CORPORATE_SECTIONS,
  schema: corporateSchema,
  defaults: CORPORATE_DEFAULTS,
  migrations: corporateMigrations,
  mapper: mapProfileToCorporate,
  renderer: CorporateRenderer,
};

export default corporateDefinition;
