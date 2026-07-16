// src/lib/templates/schemas/dark.ts
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS, type BasePortfolioData } from "./_base";
import type React from "react";

const getRenderer = (): React.ComponentType<{ data: BasePortfolioData; workspaceProfile: WorkspaceProfile }> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DarkTemplate } = require("@/components/templates/DarkTemplate");
  return function DarkAdapter({ data }: { data: BasePortfolioData; workspaceProfile: WorkspaceProfile }) {
    return DarkTemplate({ data });
  };
};

export const darkDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
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
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
