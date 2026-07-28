import type { TemplateDefinition } from "@/templates/definition";
import { boldSchema, BOLD_SECTIONS } from "./schema";
import { BOLD_DEFAULTS } from "./defaults";
import { mapProfileToBold } from "./mapper";
import { boldMigrations } from "./migrations";
import { BoldRenderer } from "./renderer";

export const boldDefinition: TemplateDefinition<typeof boldSchema> = {
  id: "bold",
  version: 1,
  meta: {
    name: "Bold",
    description: "Strong accent colors, large headings. Built for creatives and marketers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "skills", "contact"],
    tags: ["bold", "colorful", "creative", "marketing"],
    author: "portofio",
    price: 0,
  },
  sections: BOLD_SECTIONS,
  schema: boldSchema,
  defaults: BOLD_DEFAULTS,
  migrations: boldMigrations,
  mapper: mapProfileToBold,
  renderer: BoldRenderer,
};
