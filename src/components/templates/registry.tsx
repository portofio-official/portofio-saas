import type { PortfolioData } from "@/lib/portfolio/types";
import type { TemplateId } from "@/lib/templates/types";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { BoldTemplate } from "@/components/templates/BoldTemplate";
import { CreativeTemplate } from "@/components/templates/CreativeTemplate";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import { DarkTemplate } from "@/components/templates/DarkTemplate";

export const TEMPLATE_COMPONENTS: Record<TemplateId, React.ComponentType<{ data: PortfolioData }>> = {
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  creative: CreativeTemplate,
  corporate: CorporateTemplate,
  dark: DarkTemplate,
};

export function TemplateRenderer({ templateId, data }: { templateId: TemplateId; data: PortfolioData }) {
  const Template = TEMPLATE_COMPONENTS[templateId];
  return <Template data={data} />;
}
