import { BASE_DEFAULTS } from "@/templates/shared/_base";
import type { PortfolioProData } from "./schema";

export const PORTFOLIO_PRO_DEFAULTS: PortfolioProData = {
  ...BASE_DEFAULTS,
  hero: { badges: [] },
  about: { paragraphs: [], tags: [] },
  skillsShowcase: [],
  experienceDetails: [],
  educationDetails: [],
  caseStudies: [],
  certificates: [],
  gallery: [],
};
