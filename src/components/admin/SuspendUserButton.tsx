"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserSuspensionAction } from "@/lib/admin";

interface Props {
  userId: string;
  isSuspended: boolean;
}

export function SuspendUserButton({ userId, isSuspended }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // B-5: inline confirmation instead of window.confirm()
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const actionText = isSuspended ? "Reactivate" : "Suspend";

  const handleToggle = () => {
    startTransition(async () => {
      setError(null);
      setShowConfirm(false);
        try {
          await toggleUserSuspensionAction(userId, !isSuspended);
          router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {showConfirm ? (
        /* Inline confirmation — replaces window.confirm() (B-5) */
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink-soft mr-1">
            {isSuspended ? "Reactivate" : "Suspend"} user?
          </span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center rounded-full px-3 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
              isSuspended
                ? "bg-accent/10 text-accent hover:bg-accent/20"
                : "bg-danger/10 text-danger hover:bg-danger/20"
            }`}
          >
            {isPending ? "..." : "Yes"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="flex items-center rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold text-ink hover:bg-black/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50 ${
            isSuspended
              ? "bg-black/[0.04] text-ink hover:bg-black/[0.08]"
              : "bg-danger/10 text-danger hover:bg-danger/20"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isSuspended ? "settings_backup_restore" : "block"}
          </span>
          {isPending ? "Loading..." : actionText}
        </button>
      )}
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </div>
  );
}
