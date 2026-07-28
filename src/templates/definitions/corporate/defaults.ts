import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { CorporateData } from "./schema";

export const CORPORATE_DEFAULTS: CorporateData = {
  ...BASE_PROFILE_DEFAULTS,
  experiences: [],
  educations: [],
  skills: [],
  pricing: [],
};

