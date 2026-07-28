import type { WorkspaceProfile } from "@/templates/definition";
import type { FreelancerData } from "./schema";
import { freelancerDefaults } from "./defaults";

export function mapProfileToFreelancer(
  profile: WorkspaceProfile,
): FreelancerData {
  const extended = profile.extendedData ?? {};

  return {
    ...freelancerDefaults,
    profile: {
      fullName: profile.name ?? freelancerDefaults.profile.fullName,
      headline: extended.tagline ?? freelancerDefaults.profile.headline,
      bio: extended.description ?? freelancerDefaults.profile.bio,
      photoUrl: profile.logoUrl ?? "",
      location: profile.address ?? "",
    },
    tagline: extended.tagline ?? freelancerDefaults.tagline,
    contact: {
      email: profile.email ?? freelancerDefaults.contact.email,
      phone: profile.phone ?? "",
    },
    socials: (extended.socials ?? []).map((s) => ({
      platform: s.platform as FreelancerData["socials"][number]["platform"],
      url: s.url,
    })),
  };
}
