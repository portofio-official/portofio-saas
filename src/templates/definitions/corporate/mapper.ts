import type { WorkspaceProfile } from "@/templates/definition";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/templates/shared/_base";
import type { CorporateData } from "./schema";
import { CORPORATE_DEFAULTS } from "./defaults";

export function mapProfileToCorporate(profile: WorkspaceProfile): CorporateData {
  const validSocials = (profile.extendedData.socials ?? []).filter(
    (s): s is { platform: SocialPlatform; url: string } =>
      SOCIAL_PLATFORMS.includes(s.platform as SocialPlatform)
  );

  return {
    ...CORPORATE_DEFAULTS,
    profile: {
      ...CORPORATE_DEFAULTS.profile,
      fullName: profile.name ?? "",
      headline: profile.extendedData.tagline ?? "",
      bio: profile.extendedData.description ?? "",
    },
    contact: {
      ...CORPORATE_DEFAULTS.contact,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: validSocials,
  };
}
