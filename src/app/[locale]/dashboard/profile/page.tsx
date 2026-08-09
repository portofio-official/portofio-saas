import { getTranslations } from "next-intl/server";
import { getUserProfile } from "@/lib/profile/queries";
import { ProfileClientView } from "@/components/profile/ProfileClientView";

export default async function ProfilePage({
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
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <ProfileClientView
        profile={profile}
        locale={locale}
        dict={{
          title: t("title"),
          subtitle: t("subtitle"),
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
          skillsLabel: t("skillsLabel"),
          save: t("save"),
          saving: t("saving"),
          success: t("success"),
          error: t("error"),
        }}
      />
    </div>
  );
}
