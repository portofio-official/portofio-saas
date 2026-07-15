"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import shared from "./shared.module.css";
import styles from "./Hero.module.css";

const column1 = ["/portrait-data.png", "/portrait-photographer.png", "/portrait-copywriter.png", "/portrait-data.png"];
const column2 = ["/portrait-designer.png", "/hero-portrait.png", "/portrait-lecturer.png", "/portrait-designer.png"];
const column3 = ["/portrait-marketer.png", "/portrait-engineer.png", "/portrait-freelancer.png", "/portrait-marketer.png"];

export function Hero({ userEmail }: { userEmail: string | null }) {
  const t = useTranslations("Landing.Hero");

  return (
    <section className={styles.hero} id="home">
      <div className={styles.heroContainer}>
        <div className={`${styles.heroContent} ${shared.animateFadeInUp}`}>
          <h1 className={styles.heroTitle}>
            {t("titleLine1")}
            <br />
            <span style={{ color: "var(--accent-color)" }}>{t("titleAccent")}</span> {t("titleLine2")}
            <br />
            {t("titleLine3")}
          </h1>
          <p className={styles.heroSubtitle}>{t("subtitle")}</p>
          <div className={styles.heroActions}>
            <Link href={userEmail ? "/dashboard" : "/signup"} className={`${styles.btnPrimary} ${styles.btnLarge}`}>
              {userEmail ? t("ctaDashboard") : t("cta")}
            </Link>
            <div className={styles.heroUsers} style={{ marginTop: "24px" }}>
              <div
                style={{ background: "#f3f4f6", padding: "12px", borderRadius: "50%", marginRight: "12px" }}
              >
                👥
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{t("usersJoining")}</span>
                <br />
                <strong style={{ fontSize: "1.2rem", color: "#111827" }}>319,836</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.heroVisual} ${shared.animateFadeInUp} ${shared.delay200}`}>
          <div className={styles.tiltedGridContainer}>
            <div className={styles.tiltedGrid}>
              <div className={`${styles.gridCol} ${styles.scrollDown}`}>
                {column1.map((src, i) => (
                  <div key={i} className={styles.gridItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Portfolio item" />
                  </div>
                ))}
              </div>

              <div className={`${styles.gridCol} ${styles.scrollUp}`}>
                {column2.map((src, i) => (
                  <div key={i} className={styles.gridItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Portfolio item" />
                  </div>
                ))}
              </div>

              <div className={`${styles.gridCol} ${styles.scrollDownSlow}`}>
                {column3.map((src, i) => (
                  <div key={i} className={styles.gridItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Portfolio item" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
