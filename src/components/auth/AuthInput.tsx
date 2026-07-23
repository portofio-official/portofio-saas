"use client";

import React, { useState } from "react";
import styles from "./AuthSplitLayout.module.css";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  isPassword?: boolean;
}

export function AuthInput({ label, icon, isPassword, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : props.type || "text";

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={props.id || props.name}>{label}</label>
      <div className={`${styles.inputWrapper} ${!icon ? styles.noIcon : ""}`}>
        {icon && (
          <div className={styles.inputIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
              {icon}
            </span>
          </div>
        )}
        <input {...props} type={inputType} className={styles.inputField} />
        
        {isPassword && (
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
