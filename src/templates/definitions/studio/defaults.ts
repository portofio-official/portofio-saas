import { BASE_PROFILE_DEFAULTS } from "@/templates/shared/_base";
import type { StudioData } from "./schema";

export const STUDIO_DEFAULTS: StudioData = {
  ...BASE_PROFILE_DEFAULTS,
  hero: {
    headline: "We build digital experiences.",
    subheadline: "An independent studio crafting premium interfaces for the web and mobile.",
    ctaLabel: "View Selected Work",
  },
  projects: [],
  expertise: [],
  testimonials: [],
};

