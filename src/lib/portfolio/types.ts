// ponytail: thin re-export shim — keeps all existing imports working without
// touching every consumer. Will be deleted in Fase 4 after all imports are gone.
// The canonical definitions now live in src/lib/templates/schemas/_base.ts.

export type {
  BasePortfolioData as PortfolioData,
} from "@/lib/templates/schemas/_base";

export {
  BASE_DEFAULTS as EMPTY_PORTFOLIO_DATA,
} from "@/lib/templates/schemas/_base";

export const SOCIAL_PLATFORMS = [
  "linkedin",
  "github",
  "instagram",
  "x",
  "youtube",
  "tiktok",
  "website",
] as const;

// Keep TEMPLATE_IDS / TemplateId / FONT_OPTIONS / ACCENT_COLOR_PRESETS
// in src/lib/templates/types.ts (unchanged — Editor still imports from there).
