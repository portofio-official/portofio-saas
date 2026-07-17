"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import shared from "./shared.module.css";
import styles from "./Navbar.module.css";

export function Navbar({ userEmail }: { userEmail: string | null }) {
  const [activeSection, setActiveSection] = useState("home");
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Landing.Navbar");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";

      sections.forEach((section) => {
        const el = section as HTMLElement;
        const sectionTop = el.offsetTop;
        const sectionHeight = el.clientHeight;

        if (window.scrollY >= sectionTop - sectionHeight / 3) {
          current = el.getAttribute("id") ?? "";
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={`${shared.container} ${styles.navContainer}`}>
        <a href="#home" className={styles.logoLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Portofio Logo" className={styles.logoImg} />
        </a>
        <div className={styles.navLinks}>
          <a href="#home" data-text={t("home")} className={activeSection === "home" ? styles.active : ""}>
            {t("home")}
          </a>
          <a
            href="#templates"
            data-text={t("templates")}
            className={activeSection === "templates" ? styles.active : ""}
          >
            {t("templates")}
          </a>
          <a
            href="#pricing"
            data-text={t("pricing")}
            className={activeSection === "pricing" ? styles.active : ""}
          >
            {t("pricing")}
          </a>
        </div>

        <div className={styles.localeSwitcher}>
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              className={`${styles.localeOption} ${locale === loc ? styles.active : ""}`}
            >
              {loc.toUpperCase()}
            </Link>
          ))}
        </div>

        {userEmail ? (
          <Link href="/dashboard" aria-label={t("dashboard")} className={styles.profileIconLink}>
            <span className={styles.profileIconInitial}>{userEmail.charAt(0).toUpperCase()}</span>
          </Link>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            {t("login")}
          </Link>
        )}
      </div>
    </nav>
  );
}
