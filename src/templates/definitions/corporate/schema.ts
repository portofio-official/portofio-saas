import { z } from "zod";
import { baseProfileSchema, experienceSchema, educationSchema, pricingTierSchema } from "@/templates/shared/_base";

export const corporateSchema = baseProfileSchema.extend({
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  pricing: z.array(pricingTierSchema).default([]),
});

export type CorporateData = z.infer<typeof corporateSchema>;

export const CORPORATE_SECTIONS = [
  { id: "profile",    label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "education",  label: "Education" },
  { id: "skills",     label: "Skills" },
  { id: "pricing",    label: "Pricing" },
  { id: "contact",    label: "Contact & Socials" },
];

