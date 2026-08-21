import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { freelancerSchema, FREELANCER_SECTIONS } from "./schema";

export const FREELANCER_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Cobalt",
    colors: {
      primary: "#315BE8",
      background: "#FAF8F3",
      surface: "#EEECE6",
      text: "#1D2027",
      textMuted: "#656972",
      border: "#DAD7CF",
    }
  },
  {
    id: "emerald",
    label: "Terracotta",
    colors: {
      primary: "#B65436",
      background: "#FBF5EE",
      surface: "#F1E7DC",
      text: "#33231D",
      textMuted: "#79675E",
      border: "#E1D4C8",
    }
  },
  {
    id: "slate",
    label: "Olive",
    colors: {
      primary: "#61713C",
      background: "#F5F3E9",
      surface: "#E8E6D8",
      text: "#25291E",
      textMuted: "#6D7164",
      border: "#D6D4C6",
    }
  }
];

import { freelancerDefaults } from "./defaults";
import { mapProfileBase } from "@/templates/shared/_base";
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
    gallery: {
      accentBg: "bg-[#0f2027]",
      categories: ["Professional", "Personal"],
    },
  },
  variants: FREELANCER_VARIANTS,
  sections: FREELANCER_SECTIONS,
  schema: freelancerSchema,
  defaults: freelancerDefaults,
  migrations: [],
  mapper: (p) => mapProfileBase(freelancerDefaults, p),
  renderer: FreelancerRenderer,
};

export default freelancerDefinition;
