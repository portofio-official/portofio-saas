// Shared Zod schemas reused across built-in templates.
import { z } from "zod";

// Accepts https:// and http:// URLs only (or empty string).
// z.string().url() alone allows javascript: and data: URIs — this does not.
const safeUrl = z.union([
  z.literal(""),
  z.string().refine(
    (v) => /^https?:\/\/.+/.test(v),
    { message: "URL harus dimulai dengan https:// atau http://" },
  ),
]);

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
  imageUrl: safeUrl.optional(),
  link: safeUrl.optional(),
});

export const contactSchema = z.object({
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const socialSchema = z.object({
  platform: z.enum(["linkedin", "github", "instagram", "x", "youtube", "tiktok", "website"]),
  url: safeUrl,
});

export const themeSchema = z.object({
  variantId: z.string().default("default"),
});

// Reusable atom schemas for specific template capabilities
export const testimonialSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  quote: z.string().optional(),
  body: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const pricingTierSchema = z.object({
  name: z.string(),
  price: z.number(),
  currency: z.string().default("IDR"),
  period: z.enum(["monthly", "yearly", "one-time"]).default("monthly"),
  features: z.array(z.string()).default([]),
  highlighted: z.boolean().default(false),
});

export const galleryItemSchema = z.object({
  imageUrl: z.string(),
  title: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const caseStudySchema = z.object({
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

// Base profile profile — Shared fields across ALL templates (Profile, Contact, Socials, Theme)
export const baseProfileSchema = z.object({
  profile: profileSchema,
  contact: contactSchema,
  socials: z.array(socialSchema).default([]),
  theme: themeSchema,
  // Section visibility toggles set in the editor. Optional — defaults to all visible.
  hiddenSections: z.array(z.string()).default([]),
});

export type BaseProfileData = z.infer<typeof baseProfileSchema>;

export const BASE_PROFILE_DEFAULTS: BaseProfileData = {
  profile: { fullName: "", headline: "", bio: "" },
  contact: { email: "" },
  socials: [],
  theme: { 
    variantId: "default",
  },
  hiddenSections: [],
};

// Legacy base portfolio schema — kept for backward compatibility alias during refactor
export const basePortfolioSchema = baseProfileSchema.extend({
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectItemSchema).default([]),
});

export type BasePortfolioData = z.infer<typeof basePortfolioSchema>;

export const BASE_DEFAULTS: BasePortfolioData = {
  ...BASE_PROFILE_DEFAULTS,
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

export const BASE_SECTIONS = [
  { id: "profile",    label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "education",  label: "Education" },
  { id: "skills",     label: "Skills" },
  { id: "projects",   label: "Projects" },
  { id: "contact",    label: "Contact & Socials" },
];

// Shared mapper: maps a WorkspaceProfile onto any template's defaults.
// Handles the profile/contact/socials fields that every template shares.
// Templates with extra fields (e.g. Studio's hero) spread this result and
// override what they need.
export function mapProfileBase<T extends BaseProfileData>(
  defaults: T,
  profile: import("@/templates/definition").WorkspaceProfile,
): T {
  const validSocials = (profile.extendedData.socials ?? []).filter(
    (s): s is { platform: SocialPlatform; url: string } =>
      SOCIAL_PLATFORMS.includes(s.platform as SocialPlatform),
  );
  return {
    ...defaults,
    profile: {
      ...defaults.profile,
      fullName: profile.name ?? "",
      headline: profile.extendedData.tagline ?? "",
      bio: profile.extendedData.description ?? "",
    },
    contact: {
      ...defaults.contact,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: validSocials,
  };
}

export const SOCIAL_PLATFORMS = [
  "linkedin",
  "github",
  "instagram",
  "x",
  "youtube",
  "tiktok",
  "website",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
