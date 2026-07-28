export const TEMPLATE_IDS = ["minimal", "bold", "creative", "corporate", "dark", "studio", "portfolio-pro"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const FONT_OPTIONS = ["sans", "serif", "mono", "rounded"] as const;
export type FontOption = (typeof FONT_OPTIONS)[number];

// PRD 7.3: "kustomisasi terbatas" — a fixed swatch list, not a free color picker.
export const ACCENT_COLOR_PRESETS = [
  "#3532E5", // ultramarine
  "#C2382E", // red
  "#1D7A4F", // green
  "#B45309", // amber
  "#7C3AED", // violet
  "#0F172A", // near-black
] as const;
