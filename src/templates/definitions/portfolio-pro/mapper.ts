import type { WorkspaceProfile } from "@/templates/definition";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/templates/shared/_base";
import type { PortfolioProData } from "./schema";
import { PORTFOLIO_PRO_DEFAULTS } from "./defaults";

export function mapProfileToPortfolioPro(profile: WorkspaceProfile): PortfolioProData {
  const validSocials = (profile.extendedData.socials ?? []).filter(
    (s): s is { platform: SocialPlatform; url: string } =>
      SOCIAL_PLATFORMS.includes(s.platform as SocialPlatform)
  );

  return {
    ...PORTFOLIO_PRO_DEFAULTS,
    profile: {
      ...PORTFOLIO_PRO_DEFAULTS.profile,
      fullName: profile.name ?? "",
      headline: profile.extendedData.tagline ?? "",
      bio: profile.extendedData.description ?? "",
    },
    contact: {
      ...PORTFOLIO_PRO_DEFAULTS.contact,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: validSocials,
  };
}
