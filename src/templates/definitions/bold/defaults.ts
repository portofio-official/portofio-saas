import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { BoldData } from "./schema";

export const BOLD_DEFAULTS: BoldData = {
  ...BASE_PROFILE_DEFAULTS,
  experiences: [],
  skills: [],
  projects: [],
};

