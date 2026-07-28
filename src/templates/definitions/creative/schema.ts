import { z } from "zod";
import { baseProfileSchema, projectItemSchema, testimonialSchema } from "@/templates/shared/_base";

export const creativeSchema = baseProfileSchema.extend({
  projects: z.array(projectItemSchema).default([]),
  skills: z.array(z.string()).default([]),
  testimonials: z.array(testimonialSchema).default([]),
});

export type CreativeData = z.infer<typeof creativeSchema>;

export const CREATIVE_SECTIONS = [
  { id: "profile",      label: "Profile" },
  { id: "projects",     label: "Projects" },
  { id: "skills",       label: "Skills" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact",      label: "Contact & Socials" },
];

