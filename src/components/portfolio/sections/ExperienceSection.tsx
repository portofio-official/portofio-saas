import type { useTranslations } from "next-intl";
import { RepeatableSection } from "@/components/portfolio/RepeatableSection";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

type Experience = PortfolioData["experiences"][number];

export function ExperienceSection({
  t,
  items,
  onChange,
}: {
  t: ReturnType<typeof useTranslations>;
  items: Experience[];
  onChange: (items: Experience[]) => void;
}) {
  return (
    <RepeatableSection<Experience>
      eyebrow={t("eyebrow")}
      title={t("title")}
      items={items}
      onChange={onChange}
      newItem={() => ({ company: "", role: "", startDate: "" })}
      addLabel={t("addLabel")}
      removeLabel={t("removeLabel")}
      renderRow={(item, update) => (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField
              label={t("companyLabel")}
              value={item.company}
              onChange={(e) => update({ company: e.target.value })}
            />
            <FormField
              label={t("roleLabel")}
              value={item.role}
              onChange={(e) => update({ role: e.target.value })}
            />
            <FormField
              label={t("startDateLabel")}
              type="month"
              value={item.startDate}
              onChange={(e) => update({ startDate: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <FormField
                label={t("endDateLabel")}
                type="month"
                value={item.endDate ?? ""}
                onChange={(e) => update({ endDate: e.target.value || undefined })}
              />
              <span className="text-[13px] text-ink-faint">{t("endDateHint")}</span>
            </div>
          </div>
          <FormTextarea
            label={t("descriptionLabel")}
            rows={3}
            value={item.description ?? ""}
            onChange={(e) => update({ description: e.target.value })}
          />
        </>
      )}
    />
  );
}
