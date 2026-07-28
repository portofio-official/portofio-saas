import { z } from "zod";
import { baseProfileSchema, projectItemSchema } from "@/templates/shared/_base";

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

export const studioSchema = baseProfileSchema.extend({
  hero: heroSchema.default({
    headline: "We build digital experiences.",
    subheadline: "An independent studio crafting premium interfaces for the web and mobile.",
    ctaLabel: "View Selected Work",
  }),
  projects: z.array(projectItemSchema).default([]),
  expertise: z.array(expertiseItemSchema).default([]),
  testimonials: z.array(testimonialSchema).default([]),
});

export type StudioData = z.infer<typeof studioSchema>;

export const STUDIO_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "profile", label: "Profile" },
  { id: "projects", label: "Projects" },
  { id: "expertise", label: "Expertise & Services" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact & Socials" },
];
