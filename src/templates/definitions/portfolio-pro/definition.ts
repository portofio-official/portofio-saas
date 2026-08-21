import type {
  TemplateDefinition,
  TemplateVariant,
} from "@/templates/definition";
import { portfolioProSchema, PORTFOLIO_PRO_SECTIONS } from "./schema";

export const PORTFOLIO_PRO_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Editorial Blue",
    colors: {
      primary: "#3157C8",
      background: "#F5F4F0",
      surface: "#E9E8E3",
      text: "#181A20",
      textMuted: "#676A72",
      border: "#D2D1CB",
    },
  },
  {
    id: "emerald",
    label: "Executive Green",
    colors: {
      primary: "#376B55",
      background: "#F3F5F0",
      surface: "#E4E9E1",
      text: "#17261F",
      textMuted: "#647169",
      border: "#CFD7D1",
    },
  },
  {
    id: "slate",
    label: "Ink",
    colors: {
      primary: "#D87945",
      background: "#171819",
      surface: "#222426",
      text: "#F0EEE9",
      textMuted: "#A09E98",
      border: "#393B3D",
    },
  },
];

import { PORTFOLIO_PRO_DEFAULTS } from "./defaults";
import { mapProfileBase } from "@/templates/shared/_base";
import { PortfolioProRenderer } from "./renderer";

export const portfolioProDefinition: TemplateDefinition<
  typeof portfolioProSchema
> = {
  id: "portfolio-pro",
  version: 1,
  meta: {
    name: "Portfolio Pro",
    description:
      "An editorial, technically-minded portfolio for engineers and researchers: case-study work, experience, skills, certifications, and a gallery in a restrained Swiss-style layout.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: [
      "projects",
      "experience",
      "education",
      "skills",
      "contact",
      "hero",
      "case-studies",
      "certificates",
      "gallery",
    ],
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
  migrations: [],
  mapper: (p) => mapProfileBase(PORTFOLIO_PRO_DEFAULTS, p),
  renderer: PortfolioProRenderer,
};

export default portfolioProDefinition;
