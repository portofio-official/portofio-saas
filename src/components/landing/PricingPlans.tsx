"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, X } from "@phosphor-icons/react";
import shared from "./shared.module.css";
import styles from "./PricingPlans.module.css";

type Tier = {
  title: string;
  description: string;
  cta: string;
  featuresTitle: string;
  features: string[];
};

const tierPrices = [
  { monthly: "49.000", annual: "350.000" },
  { monthly: "79.000", annual: "650.000" },
  { monthly: "149.000", annual: "1.300.000" },
];

const tierFeatureIncluded = [
  [true, true, true, false, false],
  [true, true, true, true, true],
  [true, true, true, true, true],
];

// "Contact Sales" (the Custom tier) is a sales inquiry, not an account action — leave it inert.
const tierIsSignupCta = [true, true, false];

export function PricingPlans({ userEmail }: { userEmail: string | null }) {
  const t = useTranslations("Landing.PricingPlans");
  const tiers = t.raw("tiers") as Tier[];
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className={styles.pricingSection} id="pricing">
      <div className={`${shared.container} ${shared.revealOnScroll}`}>
        <div className={styles.pricingHeader}>
          <h2>
            {t("headingPrefix")} <span className={styles.textHighlight}>{t("headingHighlight")}</span>
          </h2>
          <p>{t("subheading")}</p>

          <div className={styles.billingToggle}>
            <span className={!isAnnual ? styles.active : ""}>{t("monthly")}</span>
            <button
              type="button"
              className={`${styles.toggleBtn} ${isAnnual ? styles.annual : ""}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className={styles.toggleCircle}></div>
            </button>
            <span className={isAnnual ? styles.active : ""}>
              {t("annually")} <span className={styles.saveBadge}>{t("save")}</span>
            </span>
          </div>
        </div>

        <div className={styles.pricingGrid}>
          {tiers.map((tier, i) => (
            <div className={styles.pricingCard} key={tier.title}>
              <div className={styles.cardHeader}>
                <h3>{tier.title}</h3>
                <p>{tier.description}</p>
              </div>
              <div className={styles.cardPrice}>
                <span className={styles.currency}>IDR</span>
                <span className={styles.amount}>{isAnnual ? tierPrices[i].annual : tierPrices[i].monthly}</span>
                <span className={styles.period}>{isAnnual ? "/yr" : "/mo"}</span>
              </div>
              {tierIsSignupCta[i] ? (
                <Link href={userEmail ? "/dashboard" : "/signup"} className={`${styles.btnPricing} ${styles.outline}`}>
                  {userEmail ? t("ctaDashboard") : tier.cta}
                </Link>
              ) : (
                <button type="button" className={`${styles.btnPricing} ${styles.outline}`}>{tier.cta}</button>
              )}
              <div className={styles.cardFeatures}>
                <p className={styles.featuresTitle}>{tier.featuresTitle}</p>
                <ul>
                  {tier.features.map((feature, j) => {
                    const included = tierFeatureIncluded[i][j];
                    return (
                      <li key={feature}>
                        <span className={`${styles.icon} ${included ? styles.check : styles.cross}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          {included ? <Check weight="bold" size={16} /> : <X weight="bold" size={16} />}
                        </span>{" "}
                        {feature}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
