// src/lib/templates/schemas/minimal.ts
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS, type BasePortfolioData } from "./_base";
import React from "react";

// ponytail: lazy import to avoid bloating the registry module
const getRenderer = (): React.ComponentType<{ data: BasePortfolioData; workspaceProfile: WorkspaceProfile }> => {
  // Adapter: existing MinimalTemplate takes { data: PortfolioData } — pass data directly.
  // TODO(template-refactor): update MinimalTemplate to accept new props shape
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MinimalTemplate } = require("@/components/templates/MinimalTemplate");
  return function MinimalAdapter({ data }: { data: BasePortfolioData; workspaceProfile: WorkspaceProfile }) {
    return React.createElement(MinimalTemplate, { data });
  };
};

export const minimalDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
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
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
