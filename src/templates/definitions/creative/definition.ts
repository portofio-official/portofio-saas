import type { TemplateDefinition } from "@/templates/definition";
import { creativeSchema, CREATIVE_SECTIONS } from "./schema";
import { CREATIVE_DEFAULTS } from "./defaults";
import { mapProfileToCreative } from "./mapper";
import { creativeMigrations } from "./migrations";
import { CreativeRenderer } from "./renderer";

export const creativeDefinition: TemplateDefinition<typeof creativeSchema> = {
  id: "creative",
  version: 1,
  meta: {
    name: "Creative",
    description: "Project grid front and center. Ideal for designers and photographers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "skills", "contact"],
    tags: ["grid", "visual", "design", "photography"],
    author: "portofio",
    price: 0,
  },
  sections: CREATIVE_SECTIONS,
  schema: creativeSchema,
  defaults: CREATIVE_DEFAULTS,
  migrations: creativeMigrations,
  mapper: mapProfileToCreative,
  renderer: CreativeRenderer,
};
