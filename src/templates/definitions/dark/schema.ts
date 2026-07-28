import { z } from "zod";
import { baseProfileSchema, experienceSchema, projectItemSchema } from "@/templates/shared/_base";

export const darkSchema = baseProfileSchema.extend({
  experiences: z.array(experienceSchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectItemSchema).default([]),
});

export type DarkData = z.infer<typeof darkSchema>;

export const DARK_SECTIONS = [
  { id: "profile",    label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "skills",     label: "Skills" },
  { id: "projects",   label: "Projects" },
  { id: "contact",    label: "Contact & Socials" },
];

