import type { WorkspaceProfile } from "@/templates/definition";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/templates/shared/_base";
import type { DarkData } from "./schema";
import { DARK_DEFAULTS } from "./defaults";

export function mapProfileToDark(profile: WorkspaceProfile): DarkData {
  const validSocials = (profile.extendedData.socials ?? []).filter(
    (s): s is { platform: SocialPlatform; url: string } =>
      SOCIAL_PLATFORMS.includes(s.platform as SocialPlatform)
  );

  return {
    ...DARK_DEFAULTS,
    profile: {
      ...DARK_DEFAULTS.profile,
      fullName: profile.name ?? "",
      headline: profile.extendedData.tagline ?? "",
      bio: profile.extendedData.description ?? "",
    },
    contact: {
      ...DARK_DEFAULTS.contact,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: validSocials,
  };
}
