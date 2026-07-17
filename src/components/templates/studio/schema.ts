import { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS } from "@/lib/templates/schemas/_base";
import React from "react";

const heroSchema = z.object({
  headline: z.string().default("We build digital experiences."),
  subheadline: z.string().default("An independent studio crafting premium interfaces for the web and mobile."),
  ctaLabel: z.string().default("View Selected Work"),
});

const expertiseItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const testimonialSchema = z.object({
  name: z.string(),
  role: z.string(),
  quote: z.string(),
});

// Extend base portfolio schema
export const studioSchema = basePortfolioSchema.extend({
  hero: heroSchema.default({
    headline: "We build digital experiences.",
    subheadline: "An independent studio crafting premium interfaces for the web and mobile.",
    ctaLabel: "View Selected Work",
  }),
  expertise: z.array(expertiseItemSchema).default([]),
  testimonials: z.array(testimonialSchema).default([]),
});

export type StudioData = z.infer<typeof studioSchema>;

const STUDIO_DEFAULTS: StudioData = {
  ...BASE_DEFAULTS,
  hero: {
    headline: "We build digital experiences.",
    subheadline: "An independent studio crafting premium interfaces for the web and mobile.",
    ctaLabel: "View Selected Work",
  },
  expertise: [],
  testimonials: [],
};

const STUDIO_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "profile", label: "Profile" },
  { id: "projects", label: "Projects" },
  { id: "expertise", label: "Expertise & Services" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact & Socials" },
];

const getRenderer = (): React.ComponentType<{ data: StudioData; workspaceProfile: WorkspaceProfile }> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { StudioTemplate } = require("./Template");
  return function StudioAdapter({ data, workspaceProfile }: { data: StudioData; workspaceProfile: WorkspaceProfile }) {
    return React.createElement(StudioTemplate, { data, workspaceProfile });
  };
};

export const studioDefinition: TemplateDefinition<typeof studioSchema> = {
  id: "studio",
  version: 1,
  meta: {
    name: "Vanguard Studio",
    description: "Agency-tier design with asymmetrical bento grids, ethereal glass textures, and fluid motion.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact", "hero", "expertise", "testimonials"],
    tags: ["agency", "dark", "bento", "premium", "glass"],
    author: "portofio",
    price: 0,
  },
  sections: STUDIO_SECTIONS,
  schema: studioSchema,
  defaults: STUDIO_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
