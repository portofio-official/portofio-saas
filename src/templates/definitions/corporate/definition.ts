import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";
import { corporateSchema, CORPORATE_SECTIONS } from "./schema";

export const CORPORATE_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Navy",
    colors: {
      primary: "#173B57",
      background: "#F7F6F2",
      surface: "#E9EEF1",
      text: "#12202B",
      textMuted: "#5D6871",
      border: "#CDD3D6",
    }
  },
  {
    id: "emerald",
    label: "Forest",
    colors: {
      primary: "#315B4A",
      background: "#F6F5F0",
      surface: "#E7ECE7",
      text: "#183028",
      textMuted: "#66716B",
      border: "#CDD3CE",
    }
  },
  {
    id: "slate",
    label: "Graphite",
    colors: {
      primary: "#4B5563",
      background: "#F4F4F3",
      surface: "#E7E7E5",
      text: "#202124",
      textMuted: "#666A70",
      border: "#D0D1D2",
    }
  }
];

import { CORPORATE_DEFAULTS } from "./defaults";
import { mapProfileBase } from "@/templates/shared/_base";
import { CorporateRenderer } from "./renderer";

export const corporateDefinition: TemplateDefinition<typeof corporateSchema> = {
  id: "corporate",
  version: 1,
  meta: {
    name: "Corporate",
    description: "A formal executive profile with structured experience, credentials, and consulting engagements.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["experience", "education", "skills", "pricing", "contact"],
    tags: ["formal", "executive", "consultant", "professional"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#f0f4ff]",
      categories: ["Professional"],
    },
  },
  variants: CORPORATE_VARIANTS,
  sections: CORPORATE_SECTIONS,
  schema: corporateSchema,
  defaults: CORPORATE_DEFAULTS,
  migrations: [],
  mapper: (p) => mapProfileBase(CORPORATE_DEFAULTS, p),
  renderer: CorporateRenderer,
};

export default corporateDefinition;
