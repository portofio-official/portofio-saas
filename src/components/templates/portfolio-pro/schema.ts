import { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS } from "@/lib/templates/schemas/_base";
import React from "react";

// Hero reuses profile.fullName/headline/location/bio/photoUrl and
// contact/socials for its action icons — only what's unique to the hero
// card lives here.
const heroBadgeSchema = z.object({
  logoUrl: z.string(),
  label: z.string().optional(),
});

const heroSchema = z.object({
  cvUrl: z.string().optional(),
  badges: z.array(heroBadgeSchema).max(3).default([]),
});

const aboutSchema = z.object({
  paragraphs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  yearsExperience: z.number().optional(),
});

const skillItemSchema = z.object({
  name: z.string(),
  logoUrl: z.string().optional(),
});

const experienceItemSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  logoUrl: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  period: z.string(),
  logoUrl: z.string().optional(),
  gpa: z.string().optional(),
  achievements: z.array(z.string()).default([]),
});

const caseStudySchema = z.object({
  title: z.string(),
  category: z.string().optional(),
  date: z.string().optional(),
  images: z.array(z.string()).default([]),
  description: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  confidential: z.boolean().default(false),
  link: z.string().optional(),
});

const certificateSchema = z.object({
  title: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  imageUrl: z.string().optional(),
});

const galleryItemSchema = z.object({
  imageUrl: z.string(),
  title: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

// Extend base portfolio schema — richer, parallel sections for this template.
// Base `experiences`/`educations`/`skills`/`projects` stay in the schema (shared
// editor components write to them) but this template's renderer ignores them in
// favor of the richer arrays below, same pattern as the `studio` template.
export const portfolioProSchema = basePortfolioSchema.extend({
  hero: heroSchema.default({ badges: [] }),
  about: aboutSchema.default({ paragraphs: [], tags: [] }),
  skillsShowcase: z.array(skillItemSchema).default([]),
  experienceDetails: z.array(experienceItemSchema).default([]),
  educationDetails: z.array(educationItemSchema).default([]),
  caseStudies: z.array(caseStudySchema).default([]),
  certificates: z.array(certificateSchema).default([]),
  gallery: z.array(galleryItemSchema).default([]),
});

export type PortfolioProData = z.infer<typeof portfolioProSchema>;

const PORTFOLIO_PRO_DEFAULTS: PortfolioProData = {
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

const PORTFOLIO_PRO_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  ...BASE_SECTIONS,
  { id: "skillsShowcase", label: "Skills" },
  { id: "experienceDetails", label: "Experience" },
  { id: "educationDetails", label: "Education" },
  { id: "caseStudies", label: "Case Studies" },
  { id: "certificates", label: "Certificates" },
  { id: "gallery", label: "Gallery" },
];

const getRenderer = (): React.ComponentType<{ data: PortfolioProData; workspaceProfile: WorkspaceProfile }> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PortfolioProTemplate } = require("./Template");
  return function PortfolioProAdapter({ data, workspaceProfile }: { data: PortfolioProData; workspaceProfile: WorkspaceProfile }) {
    return React.createElement(PortfolioProTemplate, { data, workspaceProfile });
  };
};

export const portfolioProDefinition: TemplateDefinition<typeof portfolioProSchema> = {
  id: "portfolio-pro",
  version: 1,
  meta: {
    name: "Portfolio Pro",
    description: "A complete professional portfolio with skills, case studies, certificates, and a gallery — plus a visitor-facing color/dark-mode switcher.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact", "hero", "case-studies", "certificates", "gallery"],
    tags: ["professional", "case-study", "analytics", "complete"],
    author: "portofio",
    price: 0,
  },
  sections: PORTFOLIO_PRO_SECTIONS,
  schema: portfolioProSchema,
  defaults: PORTFOLIO_PRO_DEFAULTS,
  migrations: [],
  get renderer() { return getRenderer(); },
};
