import { getTranslations } from "next-intl/server";
import { getUserProfile } from "@/lib/profile/queries";
import { ProfileClientView } from "@/components/profile/ProfileClientView";

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [profile, t] = await Promise.all([
    getUserProfile(),
    getTranslations("Profile")
  ]);

  return (
    <ProfileClientView
      profile={profile}
      locale={locale}
      dict={{
        title: t("title"),
        subtitle: t("subtitle"),
        eyebrow: t("eyebrow"),
        fullNameLabel: t("fullNameLabel"),
        fullNamePlaceholder: t("fullNamePlaceholder"),
        contactEmailLabel: t("contactEmailLabel"),
        contactEmailPlaceholder: t("contactEmailPlaceholder"),
        phoneLabel: t("phoneLabel"),
        phonePlaceholder: t("phonePlaceholder"),
        phoneHint: t("phoneHint"),
        countrySearch: t("countrySearch"),
        noCountryHint: t("noCountryHint"),
        addressLabel: t("addressLabel"),
        addressPlaceholder: t("addressPlaceholder"),
        nicknameLabel: t("nicknameLabel"),
        nicknamePlaceholder: t("nicknamePlaceholder"),
        headlineLabel: t("headlineLabel"),
        headlinePlaceholder: t("headlinePlaceholder"),
        bioLabel: t("bioLabel"),
        bioPlaceholder: t("bioPlaceholder"),
        socialsLabel: t("socialsLabel"),
        socialsHint: t("socialsHint"),
        skillsLabel: t("skillsLabel"),
        skillsHint: t("skillsHint"),
        groupIdentity: t("groupIdentity"),
        groupContact: t("groupContact"),
        groupPresence: t("groupPresence"),
        groupSkills: t("groupSkills"),
        identityHint: t("identityHint"),
        contactHint: t("contactHint"),
        avatarLabel: t("avatarLabel"),
        avatarUpload: t("avatarUpload"),
        avatarReplace: t("avatarReplace"),
        socialPlatformPlaceholder: t("socialPlatformPlaceholder"),
        socialUrlPlaceholder: t("socialUrlPlaceholder"),
        skillPlaceholder: t("skillPlaceholder"),
        save: t("save"),
        saving: t("saving"),
        success: t("success"),
        error: t("error"),
        remove: t("remove"),
      }}
    />
  );
}