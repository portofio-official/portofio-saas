import type { TemplateDefinition } from "@/templates/definition";
import { portfolioProSchema, PORTFOLIO_PRO_SECTIONS } from "./schema";
import { PORTFOLIO_PRO_DEFAULTS } from "./defaults";
import { mapProfileToPortfolioPro } from "./mapper";
import { portfolioProMigrations } from "./migrations";
import { PortfolioProRenderer } from "./renderer";

export const portfolioProDefinition: TemplateDefinition<typeof portfolioProSchema> = {
  id: "portfolio-pro",
  version: 1,
  meta: {
    name: "Portfolio Pro",
    description: "A complete professional portfolio with skills, case studies, certificates, and a gallery — plus a visitor-facing color/dark-mode switcher.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact", "hero", "case-studies", "certificates", "gallery"],
    tags: ["professional", "case-study", "analytics", "complete"],
    author: "portofio",
    price: 0,
  },
  sections: PORTFOLIO_PRO_SECTIONS,
  schema: portfolioProSchema,
  defaults: PORTFOLIO_PRO_DEFAULTS,
  migrations: portfolioProMigrations,
  mapper: mapProfileToPortfolioPro,
  renderer: PortfolioProRenderer,
};
