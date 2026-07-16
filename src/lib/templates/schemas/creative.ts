// src/lib/templates/schemas/creative.ts
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS, type BasePortfolioData } from "./_base";
import type React from "react";

const getRenderer = (): React.ComponentType<{ data: BasePortfolioData; workspaceProfile: WorkspaceProfile }> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CreativeTemplate } = require("@/components/templates/CreativeTemplate");
  return function CreativeAdapter({ data }: { data: BasePortfolioData; workspaceProfile: WorkspaceProfile }) {
    return CreativeTemplate({ data });
  };
};

export const creativeDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
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
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
