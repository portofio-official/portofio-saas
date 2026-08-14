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
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
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
    <div className="flex h-full flex-col overflow-y-auto bg-surface select-none">
      {/* Header */}
      <header className="shrink-0 border-b border-black/5 bg-surface px-6 pt-6 pb-5 sm:px-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-deep ring-1 ring-accent/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            LANGGANAN / BILLING
          </span>
          <h1 className="mt-2.5 font-display text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm font-medium text-ink-soft">{t("subtitle")}</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 space-y-6 px-6 py-6 sm:px-8">
        {/* Checkout Status Banners */}
        {checkoutNotice === "success" && (
          <div className="flex items-start gap-4 rounded-2xl bg-accent/10 px-5 py-4 ring-1 ring-accent/30">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-accent">
              check_circle
            </span>
            <div>
              <p className="font-display text-[14px] font-bold text-accent">{t("notice.successTitle")}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t("notice.successDesc")}</p>
            </div>
          </div>
        )}

        {checkoutNotice === "failed" && (
          <div className="flex items-start gap-4 rounded-2xl bg-danger/10 px-5 py-4 ring-1 ring-danger/30">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-danger">
              error
            </span>
            <div>
              <p className="font-display text-[14px] font-bold text-danger">{t("notice.failedTitle")}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t("notice.failedDesc")}</p>
            </div>
          </div>
        )}

        {checkoutNotice === "stub" && (
          <div className="flex items-start gap-4 rounded-2xl bg-sky-50 px-5 py-4 ring-1 ring-sky-200">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-sky-600">
              developer_mode
            </span>
            <div>
              <p className="font-display text-[14px] font-bold text-sky-900">{t("notice.stubTitle")}</p>
              <p className="mt-0.5 text-[13px] text-sky-800">{t("notice.stubDesc")}</p>
            </div>
          </div>
        )}

        {/* Grace Period Warning Banner */}
        {isGracePeriod && (
          <div className="flex items-start gap-4 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-amber-500">
              warning
            </span>
            <div>
              <p className="font-display text-[14px] font-bold text-amber-800">{t("notice.graceTitle")}</p>
              <p className="mt-0.5 text-[13px] text-amber-700">
                {t("notice.graceDesc", { days: daysRemainingInGracePeriod ?? 7 })}
              </p>
            </div>
          </div>
        )}

        {/* Auto-unpublish notice for expired */}
        {(status === "expired" || status === "canceled") && (
          <div className="flex items-start gap-4 rounded-2xl bg-danger/5 px-5 py-4 ring-1 ring-danger/20">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-danger">
              cloud_off
            </span>
            <div>
              <p className="font-display text-[14px] font-bold text-danger">{t("notice.expiredTitle")}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{t("notice.expiredDesc")}</p>
            </div>
          </div>
        )}

        {/* Subscription Card: Double Bezel */}
        <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5">
          <div className="rounded-[1.4rem] bg-surface p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  {t("currentPlan")}
                </p>
                <p className="mt-1.5 font-display text-[24px] font-bold tracking-tight text-ink">
                  {t("planName")}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">{t("planDesc")}</p>
              </div>
              <StatusBadge status={status} isGracePeriod={isGracePeriod} t={t} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-shell px-4 py-3.5 ring-1 ring-black/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  {t("statusLabel")}
                </p>
                <p className="mt-1 font-display text-[15px] font-bold text-ink capitalize">
                  {isGracePeriod ? t("badge.gracePeriod") : status.replace("_", " ")}
                </p>
              </div>
              <div className="rounded-xl bg-shell px-4 py-3.5 ring-1 ring-black/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  {isActive && !isGracePeriod ? t("renewsOn") : t("expiredOn")}
                </p>
                <p className="mt-1 font-display text-[15px] font-bold text-ink">{formatDate(expiresAt)}</p>
              </div>
            </div>

            {/* What's included */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-black/5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-3">FITUR TERMASUK</p>
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[17px] text-accent">
                    check_circle
                  </span>
                  <span className="text-[13px] font-semibold text-ink-soft">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscribe / Renew CTA */}
        {showSubscribeButton && (
          <div className="rounded-2xl bg-accent/[0.06] p-6 ring-1 ring-accent/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-[18px] font-bold tracking-tight text-ink">
                  {isGracePeriod ? t("cta.renewTitle") : t("cta.subscribeTitle")}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  {isGracePeriod ? t("cta.renewDesc") : t("cta.subscribeDesc")}
                </p>
              </div>

              {/* Nested CTA: Button-in-Button Trailing Icon */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="group relative flex h-11 shrink-0 items-center gap-3 rounded-full bg-accent pl-5 pr-2.5 text-[13px] font-bold text-white shadow-[0_10px_28px_-8px_rgba(0,207,124,0.55)] transition-all duration-300 hover:bg-accent-deep hover:shadow-[0_14px_32px_-6px_rgba(0,207,124,0.65)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    <span>{t("cta.redirecting")}</span>
                  </>
                ) : (
                  <>
                    <span>{isGracePeriod ? t("cta.renewBtn") : t("cta.subscribeBtn")}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/30">
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Dev Mode quick activation shortcut */}
            {(process.env.NODE_ENV !== "production" || checkoutNotice === "stub") && (
              <div className="mt-4 flex items-center justify-between border-t border-accent/15 pt-4">
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
          <div className="rounded-2xl bg-surface ring-1 ring-black/5 p-6 shadow-sm">
            <p className="font-display text-[15px] font-bold text-ink">{t("manage.title")}</p>
            <p className="mt-1 text-[13px] text-ink-soft leading-relaxed">
              {t("manage.desc", { email: "support@portofio.id" })}{" "}
              <a
                href="mailto:support@portofio.id"
                className="font-semibold text-accent underline-offset-2 hover:underline"
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
