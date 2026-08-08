import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { portfolioProSchema, PORTFOLIO_PRO_SECTIONS } from "./schema";

export const PORTFOLIO_PRO_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Default",
    colors: {
      primary: "#2563eb",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    }
  },
  {
    id: "emerald",
    label: "Emerald",
    colors: {
      primary: "#10b981",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#059669",
      border: "#d1fae5",
    }
  },
  {
    id: "slate",
    label: "Slate",
    colors: {
      primary: "#cbd5e1",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "#334155",
    }
  }
];

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
    gallery: {
      accentBg: "bg-[#0a0a0f]",
      categories: ["Professional", "Portfolio"],
      popular: true,
    },
  },
  variants: PORTFOLIO_PRO_VARIANTS,
  sections: PORTFOLIO_PRO_SECTIONS,
  schema: portfolioProSchema,
  defaults: PORTFOLIO_PRO_DEFAULTS,
  migrations: portfolioProMigrations,
  mapper: mapProfileToPortfolioPro,
  renderer: PortfolioProRenderer,
};

export default portfolioProDefinition;
