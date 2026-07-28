import type { WorkspaceProfile } from "@/templates/definition";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/templates/shared/_base";
import type { StudioData } from "./schema";
import { STUDIO_DEFAULTS } from "./defaults";

export function mapProfileToStudio(profile: WorkspaceProfile): StudioData {
  const validSocials = (profile.extendedData.socials ?? []).filter(
    (s): s is { platform: SocialPlatform; url: string } =>
      SOCIAL_PLATFORMS.includes(s.platform as SocialPlatform)
  );

  return {
    ...STUDIO_DEFAULTS,
    profile: {
      ...STUDIO_DEFAULTS.profile,
      fullName: profile.name ?? "",
      headline: profile.extendedData.tagline ?? "",
      bio: profile.extendedData.description ?? "",
    },
    hero: {
      ...STUDIO_DEFAULTS.hero,
      headline: profile.extendedData.tagline || STUDIO_DEFAULTS.hero.headline,
      subheadline: profile.extendedData.description || STUDIO_DEFAULTS.hero.subheadline,
    },
    contact: {
      ...STUDIO_DEFAULTS.contact,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: validSocials,
  };
}
