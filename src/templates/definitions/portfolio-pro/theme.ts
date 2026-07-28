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

export const DARK_CHROME = {
  darkBg: "bg-[#0a0a0f]",
  darkCard: "bg-[#15151b]",
  darkElement: "bg-[#1f1f27]",
  darkElementHover: "hover:bg-[#2a2a34]",
};

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

// Rotation for tag/tool chips (experience tools, project tech tags).
export const TAG_COLORS = ["#0f9d58", "#4285f4", "#db4437", "#f4b400", "#ab47bc", "#00acc1"];

// Parses a "Mon YYYY" date string into the split month/year pill shown on
// course and project cards. Returns null for missing/malformed dates.
export function dateParts(date?: string) {
  if (!date) return null;
  const parts = date.trim().split(" ");
  if (parts.length < 2) return null;
  return { month: parts[0].slice(0, 3).toUpperCase(), year: parts[1].slice(-2) };
}
