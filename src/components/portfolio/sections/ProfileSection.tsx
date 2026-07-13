import type { useTranslations } from "next-intl";
import { FormPanel } from "@/components/ui/FormPanel";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import { PhotoUploadField } from "@/components/portfolio/PhotoUploadField";
import type { PortfolioData } from "@/lib/portfolio/types";

export function ProfileSection({
  t,
  profile,
  onChange,
}: {
  t: ReturnType<typeof useTranslations>;
  profile: PortfolioData["profile"];
  onChange: (patch: Partial<PortfolioData["profile"]>) => void;
}) {
  return (
    <FormPanel eyebrow={t("eyebrow")} title={t("title")}>
      <div className="flex flex-col gap-4">
        <PhotoUploadField
          label={t("photoLabel")}
          value={profile.photoUrl}
          onChange={(photoUrl) => onChange({ photoUrl })}
          uploadLabel={t("photoUpload")}
          replaceLabel={t("photoReplace")}
        />
        <FormField
          label={t("fullNameLabel")}
          value={profile.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          required
        />
        <FormField
          label={t("headlineLabel")}
          placeholder={t("headlinePlaceholder")}
          value={profile.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
        />
        <FormTextarea
          label={t("bioLabel")}
          rows={4}
          value={profile.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
        />
        <FormField
          label={t("locationLabel")}
          value={profile.location ?? ""}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>
    </FormPanel>
  );
}
