import { z } from "zod";
import { baseProfileSchema, projectItemSchema, socialSchema, testimonialSchema } from "@/templates/shared/_base";

// Links/images/social URLs come from free-form form input (non-technical
// users, placeholder "#", bare domains, WhatsApp numbers, data: photos).
// Relax strict URL validation so one imperfect entry never drops the whole
// document back to empty defaults on the live site or gallery preview.
export const creativeSchema = baseProfileSchema.extend({
  projects: z
    .array(
      projectItemSchema.extend({
        imageUrl: z.string().optional(),
        link: z.string().optional(),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  testimonials: z.array(testimonialSchema).default([]),
  socials: z
    .array(
      socialSchema.extend({
        url: z.string().default(""),
      }),
    )
    .default([]),
});

export type CreativeData = z.infer<typeof creativeSchema>;

export const CREATIVE_SECTIONS = [
  { id: "profile",      label: "Profile" },
  { id: "projects",     label: "Projects" },
  { id: "skills",       label: "Skills" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact",      label: "Contact & Socials" },
];

