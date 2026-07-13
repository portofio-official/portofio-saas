import type { useTranslations } from "next-intl";
import { RepeatableSection } from "@/components/portfolio/RepeatableSection";
import { FormField, FormSelect } from "@/components/ui/FormField";
import { SOCIAL_PLATFORMS, type PortfolioData } from "@/lib/portfolio/types";

type Social = PortfolioData["socials"][number];

export function SocialsSection({
  t,
  items,
  onChange,
}: {
  t: ReturnType<typeof useTranslations>;
  items: Social[];
  onChange: (items: Social[]) => void;
}) {
  return (
    <RepeatableSection<Social>
      eyebrow={t("eyebrow")}
      title={t("title")}
      items={items}
      onChange={onChange}
      newItem={() => ({ platform: "website", url: "" })}
      addLabel={t("addLabel")}
      removeLabel={t("removeLabel")}
      renderRow={(item, update) => (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
          <FormSelect
            label={t("platformLabel")}
            value={item.platform}
            onChange={(e) => update({ platform: e.target.value as Social["platform"] })}
          >
            {SOCIAL_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </FormSelect>
          <FormField
            label={t("urlLabel")}
            type="url"
            value={item.url}
            onChange={(e) => update({ url: e.target.value })}
          />
        </div>
      )}
    />
  );
}
