import type { TemplateDefinition } from "@/templates/definition";
import { studioSchema, STUDIO_SECTIONS } from "./schema";
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
  },
  sections: STUDIO_SECTIONS,
  schema: studioSchema,
  defaults: STUDIO_DEFAULTS,
  migrations: studioMigrations,
  mapper: mapProfileToStudio,
  renderer: StudioRenderer,
};
