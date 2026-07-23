"use client";

import { useFormStatus } from "react-dom";
import styles from "./AuthSplitLayout.module.css";

export function AuthSubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${styles.btnLogin} ${className || ""}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
