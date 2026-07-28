import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { DarkData } from "./schema";

export const DARK_DEFAULTS: DarkData = {
  ...BASE_PROFILE_DEFAULTS,
  experiences: [],
  skills: [],
  projects: [],
};

