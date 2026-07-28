import { z } from "zod";
import {
  baseProfileSchema,
  projectItemSchema,
  testimonialSchema,
  pricingTierSchema,
} from "@/templates/shared/_base";

export const freelancerSchema = baseProfileSchema.extend({
  tagline: z.string().default(""),
  projects: z.array(projectItemSchema).default([]),
  skills: z.array(z.string()).default([]),
  testimonials: z.array(testimonialSchema).default([]),
  pricing: z.array(pricingTierSchema).default([]),
  availableForWork: z.boolean().default(true),
});

export type FreelancerData = z.infer<typeof freelancerSchema>;

export const FREELANCER_SECTIONS = [
  { id: "profile",      label: "Profile" },
  { id: "skills",       label: "Skills" },
  { id: "projects",     label: "Projects" },
  { id: "testimonials", label: "Testimonials" },
  { id: "pricing",      label: "Pricing" },
  { id: "contact",      label: "Contact & Socials" },
];
