import type { useTranslations } from "next-intl";
import { RepeatableSection } from "@/components/portfolio/RepeatableSection";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import { PhotoUploadField } from "@/components/portfolio/PhotoUploadField";
import type { PortfolioData } from "@/lib/portfolio/types";

type Project = PortfolioData["projects"][number];

export function ProjectsSection({
  t,
  items,
  onChange,
}: {
  t: ReturnType<typeof useTranslations>;
  items: Project[];
  onChange: (items: Project[]) => void;
}) {
  return (
    <RepeatableSection<Project>
      eyebrow={t("eyebrow")}
      title={t("title")}
      items={items}
      onChange={onChange}
      newItem={() => ({ title: "", description: "" })}
      addLabel={t("addLabel")}
      removeLabel={t("removeLabel")}
      renderRow={(item, update) => (
        <div className="flex flex-col gap-3">
          <PhotoUploadField
            label={t("imageLabel")}
            value={item.imageUrl}
            onChange={(imageUrl) => update({ imageUrl })}
            uploadLabel={t("imageUpload")}
            replaceLabel={t("imageReplace")}
          />
          <FormField
            label={t("titleLabel")}
            value={item.title}
            onChange={(e) => update({ title: e.target.value })}
          />
          <FormTextarea
            label={t("descriptionLabel")}
            rows={3}
            value={item.description}
            onChange={(e) => update({ description: e.target.value })}
          />
          <FormField
            label={t("linkLabel")}
            type="url"
            value={item.link ?? ""}
            onChange={(e) => update({ link: e.target.value })}
          />
        </div>
      )}
    />
  );
}
