import { getTranslations } from "next-intl/server";
import { getUserProfile } from "@/lib/profile/queries";
import { SettingsClientView } from "@/components/settings/SettingsClientView";

export default async function SettingsPage() {
  const [profile, t] = await Promise.all([
    getUserProfile(),
    getTranslations("Settings")
  ]);

  return (
    <div className="p-8 md:p-12">
      <SettingsClientView
        profile={profile}
        dict={{
          title: t("title"),
          subtitle: t("subtitle"),
          fullNameLabel: t("fullNameLabel"),
          fullNamePlaceholder: t("fullNamePlaceholder"),
          contactEmailLabel: t("contactEmailLabel"),
          contactEmailPlaceholder: t("contactEmailPlaceholder"),
          phoneLabel: t("phoneLabel"),
          phonePlaceholder: t("phonePlaceholder"),
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
