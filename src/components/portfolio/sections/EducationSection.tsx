import type { useTranslations } from "next-intl";
import { RepeatableSection } from "@/components/portfolio/RepeatableSection";
import { FormField } from "@/components/ui/FormField";
import type { BasePortfolioData as PortfolioData } from "@/lib/templates/schemas/_base";

type Education = PortfolioData["educations"][number];

export function EducationSection({
  t,
  items,
  onChange,
}: {
  t: ReturnType<typeof useTranslations>;
  items: Education[];
  onChange: (items: Education[]) => void;
}) {
  return (
    <RepeatableSection<Education>
      eyebrow={t("eyebrow")}
      title={t("title")}
      items={items}
      onChange={onChange}
      newItem={() => ({ institution: "", startYear: new Date().getFullYear() })}
      addLabel={t("addLabel")}
      removeLabel={t("removeLabel")}
      renderRow={(item, update) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            label={t("institutionLabel")}
            value={item.institution}
            onChange={(e) => update({ institution: e.target.value })}
          />
          <FormField
            label={t("degreeLabel")}
            value={item.degree ?? ""}
            onChange={(e) => update({ degree: e.target.value })}
          />
          <FormField
            label={t("fieldLabel")}
            value={item.field ?? ""}
            onChange={(e) => update({ field: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label={t("startYearLabel")}
              type="number"
              value={item.startYear}
              onChange={(e) => update({ startYear: Number(e.target.value) })}
            />
            <FormField
              label={t("endYearLabel")}
              type="number"
              value={item.endYear ?? ""}
              onChange={(e) =>
                update({ endYear: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
        </div>
      )}
    />
  );
}
