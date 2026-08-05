import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { freelancerSchema, FREELANCER_SECTIONS } from "./schema";

export const FREELANCER_VARIANTS: TemplateVariant[] = [
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

import { freelancerDefaults } from "./defaults";
import { mapProfileToFreelancer } from "./mapper";
import { freelancerMigrations } from "./migrations";
import { FreelancerRenderer } from "./renderer";

export const freelancerDefinition: TemplateDefinition<typeof freelancerSchema> = {
  id: "freelancer",
  version: 1,
  meta: {
    name: "Freelancer",
    description:
      "For independent creatives and consultants. Combines portfolio, social proof (testimonials), and transparent pricing in one page.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "skills", "testimonials", "pricing", "contact"],
    tags: ["freelancer", "pricing", "testimonials", "clean", "modern"],
    author: "portofio",
    price: 0,
  },
  variants: FREELANCER_VARIANTS,
  sections: FREELANCER_SECTIONS,
  schema: freelancerSchema,
  defaults: freelancerDefaults,
  migrations: freelancerMigrations,
  mapper: mapProfileToFreelancer,
  renderer: FreelancerRenderer,
};
