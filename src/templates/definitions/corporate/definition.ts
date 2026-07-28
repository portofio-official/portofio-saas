import type { TemplateDefinition } from "@/templates/definition";
import { corporateSchema, CORPORATE_SECTIONS } from "./schema";
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
    capabilities: ["projects", "experience", "education", "skills", "contact"],
    tags: ["formal", "timeline", "job-seeker", "professional"],
    author: "portofio",
    price: 0,
  },
  sections: CORPORATE_SECTIONS,
  schema: corporateSchema,
  defaults: CORPORATE_DEFAULTS,
  migrations: corporateMigrations,
  mapper: mapProfileToCorporate,
  renderer: CorporateRenderer,
};
