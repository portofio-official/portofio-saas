import React from "react";
import { Link } from "@/i18n/navigation";
import styles from "./AuthSplitLayout.module.css";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  leftTitle: React.ReactNode;
  leftSubtitle: string;
  mobileTitle?: string;
  showMobileBack?: boolean;
  mobileBackHref?: any; // any to satisfy next-intl Link href type issues with literal strings
  onMobileBackClick?: () => void;
  formTitle: React.ReactNode;
  formSubtitle?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthSplitLayout({
  children,
  leftTitle,
  leftSubtitle,
  mobileTitle,
  showMobileBack = true,
  mobileBackHref = "/",
  onMobileBackClick,
  formTitle,
  formSubtitle,
  footer,
}: AuthSplitLayoutProps) {
  return (
    <div className={styles.loginPageContainer}>
      {/* Left Side: Image and Branding */}
      <div className={styles.loginLeft}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Workspace Background"
          className={styles.loginBgImg}
        />

        {/* Gradient Overlay */}
        <div className={styles.loginImageOverlay}></div>

        {/* Decorative Blobs */}
        <div className={`${styles.blobShape} ${styles.blob1}`}></div>
        <div className={`${styles.blobShape} ${styles.blob2}`}></div>

        {/* Back to Website Link */}
        <Link href="/" className={styles.loginBackLink}>
          <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>
            arrow_back
          </span>
          <span>Back</span>
        </Link>

        {/* Content */}
        <div className={styles.loginContent}>
          <div style={{ marginBottom: "3rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo-Portofio-white.png" alt="Portofio Logo" style={{ height: "36px", objectFit: "contain" }} />
          </div>

          <div style={{ minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1>{leftTitle}</h1>
            <p>{leftSubtitle}</p>
          </div>

          <div className={styles.loginFeatures}>
            <div className={styles.featureIcons}>
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>brush</span>
              </div>
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>bar_chart</span>
              </div>
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>public</span>
              </div>
            </div>
            <span>Portofio Creator Studio</span>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className={styles.loginRight}>
        {/* Mobile Navbar */}
        <div className={styles.mobileNavbar}>
          {showMobileBack ? (
            onMobileBackClick ? (
              <button type="button" className={styles.mobileBackBtn} onClick={onMobileBackClick}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            ) : (
              <Link href={mobileBackHref} className={styles.mobileBackBtn}>
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
            )
          ) : (
            <div style={{ width: "2.5rem" }}></div>
          )}

          {mobileTitle && <h1 className={styles.mobileNavTitle}>{mobileTitle}</h1>}

          <div style={{ width: "2.5rem" }}></div> {/* Spacer for perfect centering */}
        </div>

        <div className={styles.formWrapper}>
          {/* Header */}
          <div className={styles.formHeader}>
            <h2>{formTitle}</h2>
            {formSubtitle && <p>{formSubtitle}</p>}
          </div>

          {children}

          {/* Footer Text */}
          {footer && <div className={styles.loginFooter}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}
