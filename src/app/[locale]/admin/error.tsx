"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminErrorState } from "@/components/admin/primitives";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Admin");

  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <AdminErrorState message={t("error.message")} retryLabel={t("error.retry")} onRetry={reset} />
    </div>
  );
}
