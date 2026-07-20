"use client";

import { useState, useTransition } from "react";
import { toggleUserSuspensionAction } from "@/lib/admin/actions";

interface Props {
  userId: string;
  isSuspended: boolean;
}

export function SuspendUserButton({ userId, isSuspended }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    // Basic confirmation
    const actionText = isSuspended ? "reactivate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) {
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        await toggleUserSuspensionAction(userId, !isSuspended);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleToggle}
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
        {isPending ? "Loading..." : isSuspended ? "Reactivate" : "Suspend"}
      </button>
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </div>
  );
}
