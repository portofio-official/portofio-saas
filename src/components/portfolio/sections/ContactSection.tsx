import type { useTranslations } from "next-intl";
import { FormPanel } from "@/components/ui/FormPanel";
import { FormField } from "@/components/ui/FormField";
import type { PortfolioData } from "@/lib/portfolio/types";

export function ContactSection({
  t,
  contact,
  onChange,
}: {
  t: ReturnType<typeof useTranslations>;
  contact: PortfolioData["contact"];
  onChange: (patch: Partial<PortfolioData["contact"]>) => void;
}) {
  return (
    <FormPanel eyebrow={t("eyebrow")} title={t("title")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          label={t("emailLabel")}
          type="email"
          value={contact.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
        <FormField
          label={t("phoneLabel")}
          type="tel"
          value={contact.phone ?? ""}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
        <FormField
          label={t("whatsappLabel")}
          type="tel"
          value={contact.whatsapp ?? ""}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
        />
      </div>
    </FormPanel>
  );
}
