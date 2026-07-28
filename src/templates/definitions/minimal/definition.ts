import type { TemplateDefinition } from "@/templates/definition";
import { minimalSchema, MINIMAL_SECTIONS } from "./schema";
import { MINIMAL_DEFAULTS } from "./defaults";
import { mapProfileToMinimal } from "./mapper";
import { minimalMigrations } from "./migrations";
import { MinimalRenderer } from "./renderer";

export const minimalDefinition: TemplateDefinition<typeof minimalSchema> = {
  id: "minimal",
  version: 1,
  meta: {
    name: "Minimal",
    description: "Clean editorial layout. Warm paper tones, serif typography, one column.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact"],
    tags: ["clean", "editorial", "serif", "light"],
    author: "portofio",
    price: 0,
  },
  sections: MINIMAL_SECTIONS,
  schema: minimalSchema,
  defaults: MINIMAL_DEFAULTS,
  migrations: minimalMigrations,
  mapper: mapProfileToMinimal,
  renderer: MinimalRenderer,
};
