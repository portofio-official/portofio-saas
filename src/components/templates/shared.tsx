import {
  GithubLogo,
  GlobeSimple,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

const SOCIAL_ICONS: Record<PortfolioData["socials"][number]["platform"], React.ComponentType<{ size?: number; weight?: "regular" | "fill" }>> = {
  linkedin: LinkedinLogo,
  github: GithubLogo,
  instagram: InstagramLogo,
  x: XLogo,
  youtube: YoutubeLogo,
  tiktok: TiktokLogo,
  website: GlobeSimple,
};

export function SocialIcon({
  platform,
  size = 18,
  weight = "regular",
}: {
  platform: PortfolioData["socials"][number]["platform"];
  size?: number;
  weight?: "regular" | "fill";
}) {
  const Icon = SOCIAL_ICONS[platform];
  return <Icon size={size} weight={weight} />;
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function formatMonth(value?: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
