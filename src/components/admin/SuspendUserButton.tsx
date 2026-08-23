"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserSuspensionAction } from "@/lib/admin";
import { useTranslations } from "next-intl";
import { ArrowClockwise, Prohibit } from "@phosphor-icons/react/dist/ssr";

interface Props {
  userId: string;
  isSuspended: boolean;
}

export function SuspendUserButton({ userId, isSuspended }: Props) {
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Inline confirmation instead of window.confirm()
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const actionText = isSuspended ? t("users.reactivate") : t("users.suspend");
  const confirmText = isSuspended ? t("users.reactivateConfirm") : t("users.suspendConfirm");

  const handleToggle = () => {
    startTransition(async () => {
      setError(null);
      setShowConfirm(false);
        try {
          await toggleUserSuspensionAction(userId, !isSuspended);
          router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("users.error"));
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {showConfirm ? (
        /* Inline confirmation — replaces window.confirm() */
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink-soft mr-1">
            {confirmText}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors active:scale-[0.97] disabled:opacity-50 ${
              isSuspended
                ? "bg-accent/10 text-accent-deep hover:bg-accent/20"
                : "bg-danger/10 text-danger hover:bg-danger/20"
            }`}
          >
            {isPending ? t("users.loading") : t("users.yes")}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="flex items-center rounded-full bg-black/5 px-3.5 py-1.5 text-[11px] font-bold text-ink hover:bg-black/10 active:scale-[0.97] transition-colors"
          >
            {t("users.cancel")}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors active:scale-[0.97] disabled:opacity-50 ${
            isSuspended
              ? "bg-ink/[0.05] text-ink hover:bg-ink/[0.08]"
              : "bg-danger/10 text-danger hover:bg-danger/20"
          }`}
        >
          {isSuspended ? <ArrowClockwise size={15} /> : <Prohibit size={15} />}
          {isPending ? t("users.loading") : actionText}
        </button>
      )}
      {error && <span className="text-[10px] font-medium text-danger">{error}</span>}
    </div>
  );
}
