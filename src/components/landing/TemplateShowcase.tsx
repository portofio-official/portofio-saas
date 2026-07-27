"use client";

import { useTranslations } from "next-intl";
import shared from "./shared.module.css";
import styles from "./TemplateShowcase.module.css";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";

export function TemplateShowcase() {
  const t = useTranslations("Landing.TemplateShowcase");

  return (
    <section className={styles.templateShowcase} id="templates">
      <div className={`${shared.container} ${shared.revealOnScroll}`}>
        <div className={styles.showcaseHeader}>
          <h2>{t("heading")}</h2>
          <p>{t("subheading")}</p>
        </div>
        <TemplateGallery embedded landingMode />
      </div>
    </section>
  );
}