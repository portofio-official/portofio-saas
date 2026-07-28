import { z } from "zod";
import {
  baseProfileSchema,
  experienceSchema,
  educationSchema,
  projectItemSchema,
  caseStudySchema,
  galleryItemSchema,
} from "@/templates/shared/_base";

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

const certificateSchema = z.object({
  title: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const portfolioProSchema = baseProfileSchema.extend({
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectItemSchema).default([]),
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

export const PORTFOLIO_PRO_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "profile", label: "Profile" },
  { id: "skillsShowcase", label: "Skills" },
  { id: "experienceDetails", label: "Experience" },
  { id: "educationDetails", label: "Education" },
  { id: "caseStudies", label: "Case Studies" },
  { id: "certificates", label: "Certificates" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact & Socials" },
];
