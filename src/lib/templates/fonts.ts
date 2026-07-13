import localFont from "next/font/local";
import type { FontOption } from "@/lib/templates/types";

// Templates are explicitly out of DESIGN.md's scope (app-shell fonts don't
// apply here) — this is the fixed "font choice" list from PRD 7.3.
// Self-hosted (not next/font/google) since build-time fetches to Google's
// CDN proved flaky in this environment; woff2s downloaded once into
// public/fonts/ instead.
const sans = localFont({
  variable: "--tpl-font-sans",
  src: [
    { path: "../../../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
});
const serif = localFont({
  variable: "--tpl-font-serif",
  src: [
    { path: "../../../public/fonts/PlayfairDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/PlayfairDisplay-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/PlayfairDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
});
const mono = localFont({
  variable: "--tpl-font-mono",
  src: [
    { path: "../../../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/JetBrainsMono-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/JetBrainsMono-Bold.woff2", weight: "700", style: "normal" },
  ],
});
const rounded = localFont({
  variable: "--tpl-font-rounded",
  src: [
    { path: "../../../public/fonts/Poppins-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/Poppins-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/Poppins-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const TEMPLATE_FONT_VARIABLES = `${sans.variable} ${serif.variable} ${mono.variable} ${rounded.variable}`;

const FONT_CLASS: Record<FontOption, string> = {
  sans: sans.className,
  serif: serif.className,
  mono: mono.className,
  rounded: rounded.className,
};

export function templateFontClass(font: string): string {
  return FONT_CLASS[font as FontOption] ?? FONT_CLASS.sans;
}
