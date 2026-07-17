// Accent color comes from portofyo's own editor (data.theme.accentColor,
// ACCENT_COLOR_PRESETS) — same system every other template uses. This
// template no longer has its own in-page color picker (that was a deliberate
// visitor-facing feature initially, removed at the user's request in favor
// of the standard editor-driven accent). Dark mode chrome (backgrounds) stays
// a single fixed palette regardless of accent color.
export interface ColorScheme {
  accent: string;
  darkBg: string;
  darkCard: string;
  darkElement: string;
  darkElementHover: string;
}

const DARK_CHROME = {
  darkBg: "bg-[#0a0a0f]",
  darkCard: "bg-[#15151b]",
  darkElement: "bg-[#1f1f27]",
  darkElementHover: "hover:bg-[#2a2a34]",
};

export function buildTheme(accentColor: string): ColorScheme {
  return { accent: accentColor, ...DARK_CHROME };
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function monogram(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

// Deterministic gradient rotation for items without a logo (institutions, tools, etc).
export const MONOGRAM_GRADIENTS = [
  "from-blue-700 to-blue-500",
  "from-emerald-700 to-green-800",
  "from-blue-700 to-slate-800",
  "from-amber-600 to-orange-700",
  "from-violet-600 to-purple-700",
  "from-sky-600 to-cyan-700",
];
