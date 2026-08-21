"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="material-symbols-outlined text-4xl text-ink-faint">error</span>
      <h2 className="text-lg font-semibold text-ink">Terjadi kesalahan</h2>
      <p className="max-w-sm text-sm text-ink-soft">
        Dashboard mengalami error. Coba muat ulang halaman.
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
