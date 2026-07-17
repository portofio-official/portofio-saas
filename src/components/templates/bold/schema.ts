// src/lib/templates/schemas/bold.ts
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS, type BasePortfolioData } from "@/lib/templates/schemas/_base";
import React from "react";

const getRenderer = (): React.ComponentType<{ data: BasePortfolioData; workspaceProfile: WorkspaceProfile }> => {
  // ponytail: adapter keeps existing BoldTemplate working unchanged
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BoldTemplate } = require("./Template");
  return function BoldAdapter({ data }: { data: BasePortfolioData; workspaceProfile: WorkspaceProfile }) {
    return React.createElement(BoldTemplate, { data });
  };
};

export const boldDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
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
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
