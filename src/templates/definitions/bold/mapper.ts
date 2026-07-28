import type { WorkspaceProfile } from "@/templates/definition";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/templates/shared/_base";
import type { BoldData } from "./schema";
import { BOLD_DEFAULTS } from "./defaults";

export function mapProfileToBold(profile: WorkspaceProfile): BoldData {
  const validSocials = (profile.extendedData.socials ?? []).filter(
    (s): s is { platform: SocialPlatform; url: string } =>
      SOCIAL_PLATFORMS.includes(s.platform as SocialPlatform)
  );

  return {
    ...BOLD_DEFAULTS,
    profile: {
      ...BOLD_DEFAULTS.profile,
      fullName: profile.name ?? "",
      headline: profile.extendedData.tagline ?? "",
      bio: profile.extendedData.description ?? "",
    },
    contact: {
      ...BOLD_DEFAULTS.contact,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: validSocials,
  };
}
