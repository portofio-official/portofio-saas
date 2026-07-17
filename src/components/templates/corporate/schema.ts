// src/lib/templates/schemas/corporate.ts
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS, type BasePortfolioData } from "./_base";
import React from "react";

const getRenderer = (): React.ComponentType<{ data: BasePortfolioData; workspaceProfile: WorkspaceProfile }> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CorporateTemplate } = require("@/components/templates/CorporateTemplate");
  return function CorporateAdapter({ data }: { data: BasePortfolioData; workspaceProfile: WorkspaceProfile }) {
    return React.createElement(CorporateTemplate, { data });
  };
};

export const corporateDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
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
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
