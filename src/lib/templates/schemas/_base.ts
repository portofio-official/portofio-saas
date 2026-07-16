// Shared Zod schemas reused across all 5 built-in templates.
// These mirror the current PortfolioData contract exactly — no breaking change
// for existing data already stored in portfolio_data.
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""),
  bio: z.string().default(""),
  photoUrl: z.string().optional(),
  location: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(), // "YYYY-MM"
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.number(),
  endYear: z.number().optional(),
});

export const projectItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
});

export const contactSchema = z.object({
  email: z.string().default(""),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const socialSchema = z.object({
  platform: z.enum(["linkedin", "github", "instagram", "x", "youtube", "tiktok", "website"]),
  url: z.string(),
});

export const themeSchema = z.object({
  accentColor: z.string().default("#3532E5"),
  font: z.enum(["sans", "serif", "mono", "rounded"]).default("sans"),
});

// Base portfolio schema — all 5 current templates share this.
// Future templates may extend or replace it.
export const basePortfolioSchema = z.object({
  profile: profileSchema,
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectItemSchema).default([]),
  contact: contactSchema,
  socials: z.array(socialSchema).default([]),
  theme: themeSchema,
});

export type BasePortfolioData = z.infer<typeof basePortfolioSchema>;

export const BASE_DEFAULTS: BasePortfolioData = {
  profile: { fullName: "", headline: "", bio: "" },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
  contact: { email: "" },
  socials: [],
  theme: { accentColor: "#3532E5", font: "sans" },
};

export const BASE_SECTIONS = [
  { id: "profile",    label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "education",  label: "Education" },
  { id: "skills",     label: "Skills" },
  { id: "projects",   label: "Projects" },
  { id: "contact",    label: "Contact & Socials" },
];
