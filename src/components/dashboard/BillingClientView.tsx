"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { SubscriptionStatus } from "@/lib/billing/types";

interface BillingClientViewProps {
  status: SubscriptionStatus;
  isActive: boolean;
  isGracePeriod: boolean;
  expiresAt: string | null;
  daysRemainingInGracePeriod?: number;
  checkoutNotice?: "success" | "failed" | "stub" | null;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
}

function StatusBadge({
  status,
  isGracePeriod,
  t,
}: {
  status: SubscriptionStatus;
  isGracePeriod: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string) => any;
}) {
  if (isGracePeriod) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-600 ring-1 ring-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {t("badge.gracePeriod")}
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[12px] font-bold text-accent ring-1 ring-accent/20">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        {t("badge.active")}
      </span>
    );
  }
  if (status === "expired" || status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-[12px] font-bold text-danger ring-1 ring-danger/20">
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
        {status === "canceled" ? t("badge.canceled") : t("badge.expired")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-[12px] font-bold text-ink-faint ring-1 ring-black/5">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
      {t("badge.noSub")}
    </span>
  );
}

export function BillingClientView({
  status,
  isActive,
  isGracePeriod,
  expiresAt,
  daysRemainingInGracePeriod,
  checkoutNotice,
}: BillingClientViewProps) {
  const t = useTranslations("Billing");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setCheckoutError(null);
    try {
      const { createCheckoutInvoiceAction } = await import("@/lib/billing/actions");
      const result = await createCheckoutInvoiceAction();
      if (result.url) {
        window.location.href = result.url;
      } else {
        setCheckoutError(result.error ?? "Failed to start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      setCheckoutError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handleDevActivate() {
    setDevLoading(true);
    try {
      const { activateDevSubscriptionAction } = await import("@/lib/billing/actions");
      const res = await activateDevSubscriptionAction();
      if (res.ok) {
        window.location.href = "/dashboard/billing";
      } else {
        setCheckoutError(res.error ?? "Failed to activate dev subscription.");
        setDevLoading(false);
      }
    } catch {
      setCheckoutError("Failed to activate dev subscription.");
      setDevLoading(false);
    }
  }

  const showSubscribeButton = !isActive || isGracePeriod;
  const features = t.raw("features") as string[];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-black/5 bg-surface/80 px-12 py-6 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="font-display text-[22px] font-bold tracking-tight text-ink leading-none">
            {t("title")}
          </h1>
          <p className="mt-1 text-[13px] font-medium text-ink-soft leading-none">
            {t("subtitle")}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-12 py-10 space-y-6">
        {/* Checkout Status Banners */}
        {checkoutNotice === "success" && (
          <div className="flex items-start gap-4 rounded-[16px] bg-accent/10 px-5 py-4 ring-1 ring-accent/30">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-accent">
              check_circle
            </span>
            <div>
              <p className="text-[14px] font-bold text-accent">{t("notice.successTitle")}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t("notice.successDesc")}</p>
            </div>
          </div>
        )}

        {checkoutNotice === "failed" && (
          <div className="flex items-start gap-4 rounded-[16px] bg-danger/10 px-5 py-4 ring-1 ring-danger/30">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-danger">
              error
            </span>
            <div>
              <p className="text-[14px] font-bold text-danger">{t("notice.failedTitle")}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t("notice.failedDesc")}</p>
            </div>
          </div>
        )}

        {checkoutNotice === "stub" && (
          <div className="flex items-start gap-4 rounded-[16px] bg-sky-50 px-5 py-4 ring-1 ring-sky-200">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-sky-600">
              developer_mode
            </span>
            <div>
              <p className="text-[14px] font-bold text-sky-900">{t("notice.stubTitle")}</p>
              <p className="mt-0.5 text-[13px] text-sky-800">{t("notice.stubDesc")}</p>
            </div>
          </div>
        )}

        {/* Grace Period Warning Banner */}
        {isGracePeriod && (
          <div className="flex items-start gap-4 rounded-[16px] bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-amber-500">
              warning
            </span>
            <div>
              <p className="text-[14px] font-bold text-amber-800">{t("notice.graceTitle")}</p>
              <p className="mt-0.5 text-[13px] text-amber-700">
                {t("notice.graceDesc", { days: daysRemainingInGracePeriod ?? 7 })}
              </p>
            </div>
          </div>
        )}

        {/* Auto-unpublish notice for expired */}
        {(status === "expired" || status === "canceled") && (
          <div className="flex items-start gap-4 rounded-[16px] bg-danger/5 px-5 py-4 ring-1 ring-danger/20">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-danger">
              cloud_off
            </span>
            <div>
              <p className="text-[14px] font-bold text-danger">{t("notice.expiredTitle")}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t("notice.expiredDesc")}</p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        <div className="rounded-[20px] bg-surface ring-1 ring-black/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-ink-faint uppercase tracking-wide">
                {t("currentPlan")}
              </p>
              <p className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-ink">
                {t("planName")}
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">{t("planDesc")}</p>
            </div>
            <StatusBadge status={status} isGracePeriod={isGracePeriod} t={t} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] bg-canvas px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                {t("statusLabel")}
              </p>
              <p className="mt-1 text-[15px] font-bold text-ink capitalize">
                {isGracePeriod ? t("badge.gracePeriod") : status.replace("_", " ")}
              </p>
            </div>
            <div className="rounded-[14px] bg-canvas px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                {isActive && !isGracePeriod ? t("renewsOn") : t("expiredOn")}
              </p>
              <p className="mt-1 text-[15px] font-bold text-ink">{formatDate(expiresAt)}</p>
            </div>
          </div>

          {/* What's included */}
          <div className="mt-6 space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[16px] text-accent">
                  check_circle
                </span>
                <span className="text-[13px] font-medium text-ink-soft">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe / Renew CTA */}
        {showSubscribeButton && (
          <div className="rounded-[20px] bg-accent/5 p-6 ring-1 ring-accent/15">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-[17px] font-bold tracking-tight text-ink">
                  {isGracePeriod ? t("cta.renewTitle") : t("cta.subscribeTitle")}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  {isGracePeriod ? t("cta.renewDesc") : t("cta.subscribeDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_0_rgba(0,207,124,0.39)] transition-all hover:bg-accent-deep hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,207,124,0.23)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    {t("cta.redirecting")}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    {isGracePeriod ? t("cta.renewBtn") : t("cta.subscribeBtn")}
                  </>
                )}
              </button>
            </div>

            {/* Dev Mode quick activation shortcut */}
            {(process.env.NODE_ENV !== "production" || checkoutNotice === "stub") && (
              <div className="mt-4 flex items-center justify-between border-t border-accent/10 pt-4">
                <p className="text-[12px] font-medium text-ink-soft">
                  <span className="font-bold text-accent">{t("dev.label")}</span>{" "}
                  {t("dev.hint")}
                </p>
                <button
                  type="button"
                  onClick={handleDevActivate}
                  disabled={devLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-black/10 transition-colors disabled:opacity-50"
                >
                  {devLoading ? t("dev.activating") : t("dev.btn")}
                </button>
              </div>
            )}

            {checkoutError && (
              <p className="mt-3 text-[13px] font-medium text-danger">{checkoutError}</p>
            )}
          </div>
        )}

        {/* Active subscription management */}
        {isActive && !isGracePeriod && (
          <div className="rounded-[20px] bg-surface ring-1 ring-black/5 p-6">
            <p className="text-[14px] font-bold text-ink">{t("manage.title")}</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {t("manage.desc", { email: "support@portofio.id" })}{" "}
              <a
                href="mailto:support@portofio.id"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                support@portofio.id
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
