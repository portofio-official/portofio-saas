import { z } from "zod";
import { baseProfileSchema, projectItemSchema } from "@/templates/shared/_base";

export const minimalSchema = baseProfileSchema.extend({
  skills: z.array(z.string()).default([]),
  projects: z.array(projectItemSchema).default([]),
});

export type MinimalData = z.infer<typeof minimalSchema>;

export const MINIMAL_SECTIONS = [
  { id: "profile",  label: "Profile" },
  { id: "skills",   label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact",  label: "Contact & Socials" },
];

