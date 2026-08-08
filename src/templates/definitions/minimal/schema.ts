import { z } from "zod";
import { baseProfileSchema, projectItemSchema, socialSchema } from "@/templates/shared/_base";

export const minimalSchema = baseProfileSchema.extend({
  skills: z.array(z.string()).default([]),
  // Links/images/social URLs come from free-form form input (non-technical
  // users, placeholder "#", bare domains, WhatsApp numbers, data: photos).
  // Relax strict URL validation so one imperfect entry never drops the whole
  // document back to empty defaults on the live site.
  projects: z
    .array(
      projectItemSchema.extend({
        imageUrl: z.string().optional(),
        link: z.string().optional(),
      }),
    )
    .default([]),
  socials: z
    .array(
      socialSchema.extend({
        url: z.string().default(""),
      }),
    )
    .default([]),
});

export type MinimalData = z.infer<typeof minimalSchema>;

export const MINIMAL_SECTIONS = [
  { id: "profile",  label: "Profile" },
  { id: "skills",   label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact",  label: "Contact & Socials" },
];

