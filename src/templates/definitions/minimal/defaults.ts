import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { MinimalData } from "./schema";

export const MINIMAL_DEFAULTS: MinimalData = {
  ...BASE_PROFILE_DEFAULTS,
  skills: [],
  projects: [],
};

