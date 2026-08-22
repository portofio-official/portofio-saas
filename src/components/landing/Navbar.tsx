"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth";
import { isSuperuserTestEmail } from "@/lib/auth/superuser";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import shared from "./shared.module.css";
import styles from "./Navbar.module.css";
import { LANDING_SECTION_IDS, useScrollSpy } from "@/hooks/useScrollSpy";

export function Navbar({ userEmail, userRole = "user" }: { userEmail: string | null; userRole?: string }) {
  const activeSection = useScrollSpy(LANDING_SECTION_IDS);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Landing.Navbar");
  const isSuperuser = isSuperuserTestEmail(userEmail);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    if (dropdownOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen, mobileMenuOpen]);

  // Robust in-page anchor navigation. Native hash links can lose the scroll on
  // pages with smooth-scroll + scroll-snap (Safari in particular), so we drive
  // the scroll ourselves and only mirror the hash into the URL.
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const sectionLinks = (
    <>
      <a href="#home" data-text={t("home")} onClick={(e) => scrollToSection(e, "home")} className={activeSection === "home" ? styles.active : ""}>
        {t("home")}
      </a>
      <a
        href="#templates"
        data-text={t("templates")}
        onClick={(e) => scrollToSection(e, "templates")}
        className={activeSection === "templates" ? styles.active : ""}
      >
        {t("templates")}
      </a>
      <a
        href="#pricing"
        data-text={t("pricing")}
        onClick={(e) => scrollToSection(e, "pricing")}
        className={activeSection === "pricing" ? styles.active : ""}
      >
        {t("pricing")}
      </a>
      <a
        href="#faq"
        data-text={t("faq")}
        onClick={(e) => scrollToSection(e, "faq")}
        className={activeSection === "faq" ? styles.active : ""}
      >
        {t("faq")}
      </a>
    </>
  );

  return (
    <nav className={styles.navbar}>
      <div className={`${shared.container} ${styles.navContainer}`}>
        <a href="#home" onClick={(e) => scrollToSection(e, "home")} className={styles.logoLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Portofio Logo" className={styles.logoImg} />
        </a>
        <div className={styles.navLinks}>{sectionLinks}</div>

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
                <Link
                  href={userRole === "admin" || isSuperuser ? "/admin/profile" : "/dashboard/profile"}
                  onClick={() => setDropdownOpen(false)}
                  className={styles.profileDropdownItem}
                >
                  <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>person</span>
                  {t("profile")}
                </Link>

                {(userRole !== "admin" || isSuperuser) && (
                  <Link href="/dashboard" className={styles.profileDropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>grid_view</span>
                    {t("myWorkspace")}
                  </Link>
                )}

                {(userRole === "admin" || isSuperuser) && (
                  <Link href="/admin" className={styles.profileDropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span className={`material-symbols-outlined ${styles.dropdownIcon}`}>admin_panel_settings</span>
                    {t("adminDashboard")}
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

        <button
          type="button"
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={t("menu")}
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      <div ref={mobileMenuRef} className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <div className={styles.mobileMenuLinks}>{sectionLinks}</div>
        <div className={styles.mobileMenuDivider} />
        <Link href={userEmail ? (userRole === "admin" ? "/admin" : "/dashboard") : "/login"} className={styles.mobileMenuCta} onClick={() => setMobileMenuOpen(false)}>
          {userEmail ? t("myWorkspace") : t("login")}
        </Link>
      </div>
    </nav>
  );
}
