// Color-scheme system for the Portfolio Pro template's visitor-facing
// color/dark-light picker — ported from the source design's `colorSchemes`.
// Only fields actually read by the renderer are kept (the source design also
// defined `glowLight1/2/3` and `theme.gradient` per scheme but never rendered
// them — dropped here as dead data). The source's "google" 4-color conic
// scheme (gradient text + multi-color swatch) was simplified to a plain
// amber accent, consistent with the other 4 solid-color schemes.
export const COLOR_SCHEMES = {
  purple: {
    accent: "#847BFF",
    darkBg: "bg-[#111126]",
    darkCard: "bg-[#16172E]",
    darkElement: "bg-[#1D1E3A]",
    darkElementHover: "hover:bg-[#282a52]",
    accentTextDark: "text-[#847BFF]",
    accentTextLight: "text-[#6366F1]",
    accentBgDark: "bg-[#9B93FF]",
    accentBgLight: "bg-[#6366F1]",
    accentHoverDark: "hover:bg-[#867eff]",
    accentHoverLight: "hover:bg-[#4f46e5]",
    glow1: "bg-[#2d1b54]",
    glow2: "bg-[#392570]",
    glow3: "bg-[#1e2354]",
  },
  emerald: {
    accent: "#34d399",
    darkBg: "bg-[#020617]",
    darkCard: "bg-[#0f172a]",
    darkElement: "bg-[#1e293b]",
    darkElementHover: "hover:bg-[#334155]",
    accentTextDark: "text-emerald-400",
    accentTextLight: "text-emerald-600",
    accentBgDark: "bg-emerald-400",
    accentBgLight: "bg-emerald-500",
    accentHoverDark: "hover:bg-emerald-500",
    accentHoverLight: "hover:bg-emerald-600",
    glow1: "bg-emerald-900/40",
    glow2: "bg-teal-900/40",
    glow3: "bg-slate-800/60",
  },
  ocean: {
    accent: "#60a5fa",
    darkBg: "bg-[#020617]",
    darkCard: "bg-[#0f172a]",
    darkElement: "bg-[#1e293b]",
    darkElementHover: "hover:bg-[#334155]",
    accentTextDark: "text-blue-400",
    accentTextLight: "text-blue-600",
    accentBgDark: "bg-blue-400",
    accentBgLight: "bg-blue-500",
    accentHoverDark: "hover:bg-blue-500",
    accentHoverLight: "hover:bg-blue-600",
    glow1: "bg-blue-900/40",
    glow2: "bg-indigo-900/40",
    glow3: "bg-sky-900/40",
  },
  rose: {
    accent: "#fb7185",
    darkBg: "bg-[#0a0a0a]",
    darkCard: "bg-[#171717]",
    darkElement: "bg-[#262626]",
    darkElementHover: "hover:bg-[#404040]",
    accentTextDark: "text-rose-400",
    accentTextLight: "text-rose-600",
    accentBgDark: "bg-rose-400",
    accentBgLight: "bg-rose-500",
    accentHoverDark: "hover:bg-rose-500",
    accentHoverLight: "hover:bg-rose-600",
    glow1: "bg-rose-900/40",
    glow2: "bg-pink-900/40",
    glow3: "bg-red-900/40",
  },
  amber: {
    accent: "#f59e0b",
    darkBg: "bg-[#0c0a09]",
    darkCard: "bg-[#1c1917]",
    darkElement: "bg-[#292524]",
    darkElementHover: "hover:bg-[#44403c]",
    accentTextDark: "text-amber-400",
    accentTextLight: "text-amber-600",
    accentBgDark: "bg-amber-400",
    accentBgLight: "bg-amber-500",
    accentHoverDark: "hover:bg-amber-500",
    accentHoverLight: "hover:bg-amber-600",
    glow1: "bg-amber-900/40",
    glow2: "bg-orange-900/40",
    glow3: "bg-yellow-900/30",
  },
} as const;

export type SchemeKey = keyof typeof COLOR_SCHEMES;
export type ColorScheme = (typeof COLOR_SCHEMES)[SchemeKey];

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
