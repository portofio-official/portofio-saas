"use client";

import { useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <WarningCircle weight="duotone" size={40} className="text-ink-faint" />
      <h2 className="text-lg font-semibold text-ink">Terjadi kesalahan di Admin Panel</h2>
      <p className="max-w-sm text-sm text-ink-soft">
        Halaman ini mengalami error. Coba muat ulang.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
      >
        Coba lagi
      </button>
    </div>
  );
}
