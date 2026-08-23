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

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary";

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
          <span className="mr-1 text-[11px] font-medium text-admin-ink-soft">{confirmText}</span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`flex h-9 items-center rounded-admin-sm px-3.5 text-[11px] font-bold transition-colors disabled:opacity-50 ${FOCUS_RING} ${
              isSuspended
                ? "bg-admin-primary-tint text-admin-primary-text hover:brightness-95"
                : "bg-admin-rose-tint text-admin-rose hover:brightness-95"
            }`}
          >
            {isPending ? t("users.loading") : t("users.yes")}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className={`flex h-9 items-center rounded-admin-sm bg-admin-ink/5 px-3.5 text-[11px] font-bold text-admin-ink transition-colors hover:bg-admin-ink/10 ${FOCUS_RING}`}
          >
            {t("users.cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className={`flex h-9 items-center gap-1.5 rounded-admin-sm px-3.5 text-[12px] font-semibold transition-colors disabled:opacity-50 ${FOCUS_RING} ${
            isSuspended
              ? "bg-admin-ink/[0.05] text-admin-ink hover:bg-admin-ink/[0.08]"
              : "bg-admin-rose-tint text-admin-rose hover:brightness-95"
          }`}
        >
          {isSuspended ? <ArrowClockwise size={15} /> : <Prohibit size={15} />}
          {isPending ? t("users.loading") : actionText}
        </button>
      )}
      {error && <span className="text-[10px] font-medium text-admin-rose">{error}</span>}
    </div>
  );
}
