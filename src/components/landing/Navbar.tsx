"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/actions";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import shared from "./shared.module.css";
import styles from "./Navbar.module.css";

export function Navbar({ userEmail, userRole = "user" }: { userEmail: string | null; userRole?: string }) {
  const [activeSection, setActiveSection] = useState("home");
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Landing.Navbar");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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
          <a
            href="#faq"
            data-text={t("faq")}
            className={activeSection === "faq" ? styles.active : ""}
          >
            {t("faq")}
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
          <div className={styles.profileDropdownContainer} ref={dropdownRef}>
            <button 
              type="button"
              className={styles.profileIconLink} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-label={t("profile")}
            >
              <span className={styles.profileIconInitial}>{userEmail.charAt(0).toUpperCase()}</span>
            </button>
            {dropdownOpen && (
              <div className={styles.profileDropdownMenu}>
                <Link href="#" onClick={(e) => { e.preventDefault(); alert("Profile page coming soon"); setDropdownOpen(false); }} className={styles.profileDropdownItem}>
                  <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>person</span>
                  {t("profile")}
                </Link>
                <Link href="/dashboard" className={styles.profileDropdownItem} onClick={() => setDropdownOpen(false)}>
                  <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>grid_view</span>
                  {t("myWorkspace")}
                </Link>
                
                {userRole === "admin" && (
                  <Link href="/admin" className={styles.profileDropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>admin_panel_settings</span>
                    {t("adminDashboard")}
                  </Link>
                )}

                {userRole === "designer" && (
                  <Link href="/dashboard" className={styles.profileDropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>palette</span>
                    {t("designerDashboard")}
                  </Link>
                )}

                <div className={styles.profileDropdownDivider}></div>
                
                <form action={signOutAction}>
                  <button type="submit" className={`${styles.profileDropdownItem} ${styles.logoutBtn} w-full`}>
                    <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>logout</span>
                    {t("logout")}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            {t("login")}
          </Link>
        )}
      </div>
    </nav>
  );
}
