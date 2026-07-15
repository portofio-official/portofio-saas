"use client";

import { useTranslations } from "next-intl";
import shared from "./shared.module.css";
import styles from "./Footer.module.css";

export function Footer() {
  const t = useTranslations("Landing.Footer");

  return (
    <footer className={styles.footerSection}>
      <div className={shared.container}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Portofio Logo"
              className={styles.footerLogo}
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p>{t("tagline")}</p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialIcon}>
                Tw
              </a>
              <a href="#" className={styles.socialIcon}>
                In
              </a>
              <a href="#" className={styles.socialIcon}>
                Ig
              </a>
            </div>
          </div>

          <div className={styles.footerLinksGroup}>
            <div className={styles.footerColumn}>
              <h4>{t("productHeading")}</h4>
              <a href="#">{t("template")}</a>
              <a href="#">{t("pricing")}</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>{t("resourcesHeading")}</h4>
              <a href="#">{t("guide")}</a>
              <a href="#">{t("help")}</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>{t("companyHeading")}</h4>
              <a href="#">{t("aboutUs")}</a>
              <a href="#">{t("contact")}</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className={styles.legalLinks}>
            <a href="#">{t("privacy")}</a>
            <a href="#">{t("terms")}</a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
