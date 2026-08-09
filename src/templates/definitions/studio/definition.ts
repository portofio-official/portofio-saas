import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { studioSchema, STUDIO_SECTIONS } from "./schema";

export const STUDIO_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Signal",
    colors: {
      primary: "#FF4D24",
      background: "#11110F",
      surface: "#1A1A17",
      text: "#F1EFE8",
      textMuted: "#98978F",
      border: "#35352F",
    }
  },
  {
    id: "emerald",
    label: "Volt",
    colors: {
      primary: "#C7FF32",
      background: "#10120D",
      surface: "#191D13",
      text: "#F1F5E8",
      textMuted: "#939B85",
      border: "#343A2B",
    }
  },
  {
    id: "slate",
    label: "Mineral",
    colors: {
      primary: "#345BFF",
      background: "#F0EFEA",
      surface: "#E3E2DC",
      text: "#17181B",
      textMuted: "#66686F",
      border: "#C8C7C1",
    }
  }
];

import { STUDIO_DEFAULTS } from "./defaults";
import { mapProfileToStudio } from "./mapper";
import { studioMigrations } from "./migrations";
import { StudioRenderer } from "./renderer";

export const studioDefinition: TemplateDefinition<typeof studioSchema> = {
  id: "studio",
  version: 1,
  meta: {
    name: "Vanguard Studio",
    description: "An avant-garde studio portfolio with monumental typography, cinematic project direction, and editorial motion.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact", "hero", "expertise", "testimonials"],
    tags: ["agency", "editorial", "avant-garde", "motion", "premium"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#050505]",
      categories: ["Creative", "Portfolio"],
      popular: true,
    },
  },
  variants: STUDIO_VARIANTS,
  sections: STUDIO_SECTIONS,
  schema: studioSchema,
  defaults: STUDIO_DEFAULTS,
  migrations: studioMigrations,
  mapper: mapProfileToStudio,
  renderer: StudioRenderer,
};

export default studioDefinition;
