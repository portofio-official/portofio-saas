"use client";

import { useTranslations } from "next-intl";
import shared from "./shared.module.css";
import styles from "./FAQ.module.css";
import { Footer } from "./Footer";

type FaqItem = { question: string; answer: string };

export function FAQ() {
  const t = useTranslations("Landing.FAQ");
  const faqData = t.raw("items") as FaqItem[];

  return (
    <section id="faq" className={styles.faqSection}>
      <div className={`${styles.faqContentWrapper} ${shared.container}`}>
        <div className={`${styles.faqHeaderRow} ${shared.revealOnScroll}`}>
          <div className={styles.faqHeaderText}>
            <h2 className={styles.sectionTitle}>{t("heading")}</h2>
            <p className={styles.sectionSubtitle}>{t("subheading")}</p>
          </div>
          <div>
            <a
              href="#all-faq"
              className={styles.btnOutlineGreen}
              onClick={(e) => {
                e.preventDefault();
                alert(t("comingSoon"));
              }}
            >
              {t("viewAll")}
            </a>
          </div>
        </div>

        <div className={`${styles.faqGrid} ${shared.revealOnScroll}`} style={{ animationDelay: "0.2s" }}>
          {faqData.map((faq, index) => (
            <div key={index} className={styles.faqStaticCard}>
              <div className={styles.faqStaticNumber}>0{index + 1}</div>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </section>
  );
}
