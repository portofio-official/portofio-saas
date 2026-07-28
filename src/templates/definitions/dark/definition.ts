import type { TemplateDefinition } from "@/templates/definition";
import { darkSchema, DARK_SECTIONS } from "./schema";
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
  sections: DARK_SECTIONS,
  schema: darkSchema,
  defaults: DARK_DEFAULTS,
  migrations: darkMigrations,
  mapper: mapProfileToDark,
  renderer: DarkRenderer,
};
