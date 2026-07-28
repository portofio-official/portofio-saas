import type { TemplateDefinition } from "@/templates/definition";
import { freelancerSchema, FREELANCER_SECTIONS } from "./schema";
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
  sections: FREELANCER_SECTIONS,
  schema: freelancerSchema,
  defaults: freelancerDefaults,
  migrations: freelancerMigrations,
  mapper: mapProfileToFreelancer,
  renderer: FreelancerRenderer,
};
