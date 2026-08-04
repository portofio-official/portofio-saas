"use client";

import { useState } from "react";
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

function StatusBadge({ status, isGracePeriod }: { status: SubscriptionStatus; isGracePeriod: boolean }) {
  if (isGracePeriod) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-600 ring-1 ring-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Grace Period
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[12px] font-bold text-accent ring-1 ring-accent/20">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        Active
      </span>
    );
  }
  if (status === "expired" || status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-[12px] font-bold text-danger ring-1 ring-danger/20">
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
        {status === "canceled" ? "Canceled" : "Expired"}
      </span>
    );
  }
  // inactive / no subscription
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-[12px] font-bold text-ink-faint ring-1 ring-black/5">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
      No Subscription
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

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-black/5 bg-surface/80 px-12 py-6 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="font-display text-[22px] font-bold tracking-tight text-ink leading-none">
            Billing
          </h1>
          <p className="mt-1 text-[13px] font-medium text-ink-soft leading-none">
            Manage your subscription and billing details
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
              <p className="text-[14px] font-bold text-accent">
                Pembayaran Berhasil!
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Langganan Portofio Pro Anda telah aktif. Anda sekarang dapat mempublikasikan situs web Anda.
              </p>
            </div>
          </div>
        )}

        {checkoutNotice === "failed" && (
          <div className="flex items-start gap-4 rounded-[16px] bg-danger/10 px-5 py-4 ring-1 ring-danger/30">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-danger">
              error
            </span>
            <div>
              <p className="text-[14px] font-bold text-danger">
                Pembayaran Gagal atau Dibatalkan
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Proses pembayaran belum selesai. Silakan coba kembali untuk mengaktifkan langganan Anda.
              </p>
            </div>
          </div>
        )}

        {checkoutNotice === "stub" && (
          <div className="flex items-start gap-4 rounded-[16px] bg-sky-50 px-5 py-4 ring-1 ring-sky-200">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-sky-600">
              developer_mode
            </span>
            <div>
              <p className="text-[14px] font-bold text-sky-900">
                Dev Mode: Checkout Disimulasikan
              </p>
              <p className="mt-0.5 text-[13px] text-sky-800">
                `XENDIT_SECRET_KEY` belum dikonfigurasi di environment. Klik tombol di bawah untuk mengaktifkan langganan uji secara instan.
              </p>
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
              <p className="text-[14px] font-bold text-amber-800">
                Your subscription has expired
              </p>
              <p className="mt-0.5 text-[13px] text-amber-700">
                You have{" "}
                <span className="font-bold">
                  {daysRemainingInGracePeriod ?? 7} day
                  {(daysRemainingInGracePeriod ?? 7) !== 1 ? "s" : ""}
                </span>{" "}
                remaining in your grace period. Your published sites are still live. Renew now to avoid auto-unpublish.
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
              <p className="text-[14px] font-bold text-danger">
                Your sites have been unpublished
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Your portfolio data is safe. Subscribe again to republish your sites instantly.
              </p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        <div className="rounded-[20px] bg-surface ring-1 ring-black/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-ink-faint uppercase tracking-wide">
                Current Plan
              </p>
              <p className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-ink">
                Portofio Pro
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">
                Publish unlimited portfolio sites to your subdomain
              </p>
            </div>
            <StatusBadge status={status} isGracePeriod={isGracePeriod} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] bg-canvas px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                Status
              </p>
              <p className="mt-1 text-[15px] font-bold text-ink capitalize">
                {isGracePeriod ? "Grace Period" : status.replace("_", " ")}
              </p>
            </div>
            <div className="rounded-[14px] bg-canvas px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                {isActive && !isGracePeriod ? "Renews on" : "Expired on"}
              </p>
              <p className="mt-1 text-[15px] font-bold text-ink">
                {formatDate(expiresAt)}
              </p>
            </div>
          </div>

          {/* What's included */}
          <div className="mt-6 space-y-2">
            {[
              "Publish portfolio sites to portofio.id/sites/yourname",
              "Update & republish anytime",
              "Unpublish and republish freely",
              "All 8 premium templates",
              "Real-time live preview",
              "Auto-save drafts",
            ].map((feature) => (
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
                  {isGracePeriod ? "Renew your subscription" : "Get started with Portofio Pro"}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  {isGracePeriod
                    ? "Renew now to keep your sites live and avoid interruption."
                    : "Subscribe to publish your portfolio to the world."}
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
                    Redirecting…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    {isGracePeriod ? "Renew Now" : "Subscribe — Rp 49.000 / bulan"}
                  </>
                )}
              </button>
            </div>

            {/* Dev Mode quick activation shortcut */}
            {(process.env.NODE_ENV !== "production" || checkoutNotice === "stub") && (
              <div className="mt-4 flex items-center justify-between border-t border-accent/10 pt-4">
                <p className="text-[12px] font-medium text-ink-soft">
                  <span className="font-bold text-accent">Dev Tools:</span> Test subscription activation without payment gateway
                </p>
                <button
                  type="button"
                  onClick={handleDevActivate}
                  disabled={devLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-black/10 transition-colors disabled:opacity-50"
                >
                  {devLoading ? "Activating..." : "⚡ Activate Test Sub (30 days)"}
                </button>
              </div>
            )}

            {checkoutError && (
              <p className="mt-3 text-[13px] font-medium text-danger">
                {checkoutError}
              </p>
            )}
          </div>
        )}

        {/* Active subscription management */}
        {isActive && !isGracePeriod && (
          <div className="rounded-[20px] bg-surface ring-1 ring-black/5 p-6">
            <p className="text-[14px] font-bold text-ink">Manage Subscription</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              To cancel your subscription, contact support at{" "}
              <a
                href="mailto:support@portofio.id"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                support@portofio.id
              </a>
              . Your sites will remain live until your subscription period ends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
