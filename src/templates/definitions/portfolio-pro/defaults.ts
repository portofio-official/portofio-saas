import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { PortfolioProData } from "./schema";

export const PORTFOLIO_PRO_DEFAULTS: PortfolioProData = {
  ...BASE_PROFILE_DEFAULTS,
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
  hero: { badges: [] },
  about: { paragraphs: [], tags: [] },
  skillsShowcase: [],
  experienceDetails: [],
  educationDetails: [],
  caseStudies: [],
  certificates: [],
  gallery: [],
};

