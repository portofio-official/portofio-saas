import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { CreativeData } from "./schema";

export const CREATIVE_DEFAULTS: CreativeData = {
  ...BASE_PROFILE_DEFAULTS,
  projects: [],
  skills: [],
  testimonials: [],
};

