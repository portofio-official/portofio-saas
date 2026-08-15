"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { BillingCycle, PlanRecord, SubscriptionStatus } from "@/lib/billing/types";

interface BillingClientViewProps {
  status: SubscriptionStatus;
  isActive: boolean;
  isGracePeriod: boolean;
  expiresAt: string | null;
  planId?: string | null;
  planName?: string | null;
  billingCycle?: BillingCycle | null;
  daysRemainingInGracePeriod?: number;
  checkoutNotice?: "success" | "failed" | "stub" | null;
  plans: PlanRecord[];
}

const TIER_ORDER: PlanRecord["tier"][] = ["basic", "premium", "enterprise"];

function formatPrice(priceIdr: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(priceIdr);
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
  planId,
  planName,
  billingCycle,
  daysRemainingInGracePeriod,
  checkoutNotice,
  plans,
}: BillingClientViewProps) {
  const t = useTranslations("Billing");
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>(billingCycle ?? "monthly");

  async function handleCheckout(selectedPlanId: string) {
    setLoadingPlanId(selectedPlanId);
    setCheckoutError(null);
    try {
      const { createCheckoutInvoiceAction } = await import("@/lib/billing/actions");
      const result = await createCheckoutInvoiceAction(selectedPlanId);
      if (result.url) {
        window.location.assign(result.url);
      } else {
        setCheckoutError(result.error ?? "Failed to start checkout. Please try again.");
        setLoadingPlanId(null);
      }
    } catch {
      setCheckoutError("An unexpected error occurred. Please try again.");
      setLoadingPlanId(null);
    }
  }

  async function handleDevActivate() {
    setDevLoading(true);
    try {
      const { activateDevSubscriptionAction } = await import("@/lib/billing/actions");
      const res = await activateDevSubscriptionAction();
      if (res.ok) {
        router.refresh();
      } else {
        setCheckoutError(res.error ?? "Failed to activate dev subscription.");
        setDevLoading(false);
      }
    } catch {
      setCheckoutError("Failed to activate dev subscription.");
      setDevLoading(false);
    }
  }

  const showSubscribeSection = !isActive || isGracePeriod;
  const currentPlanName = planName ?? "—";
  const priceFor = (plan: PlanRecord) => plan.price_idr;
  const planFor = (tier: PlanRecord["tier"]) => plans.find((p) => p.tier === tier && p.billing_cycle === cycle);

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
                  {currentPlanName}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  {billingCycle ? t("planCycle", { cycle: billingCycle }) : t("planDesc")}
                </p>
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
          </div>
        </div>

        {/* Plan picker */}
        <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5">
          <div className="rounded-[1.4rem] bg-surface p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-[18px] font-bold tracking-tight text-ink">
                  {t("picker.title")}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">{t("picker.subtitle")}</p>
              </div>
              {/* Monthly / Annual toggle */}
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-shell p-1 ring-1 ring-black/5">
                {(["monthly", "annual"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCycle(c)}
                    className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${
                      cycle === c ? "bg-accent text-white shadow-sm" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {t(`picker.${c}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {TIER_ORDER.map((tier) => {
                const plan = planFor(tier);
                if (!plan) return null;
                const selected = plan.id === planId;
                const isCurrentPlan = selected && isActive && !isGracePeriod;
                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col rounded-2xl bg-shell p-5 ring-1 transition-shadow ${
                      isCurrentPlan ? "ring-accent/40 shadow-[0_10px_30px_-12px_rgba(0,207,124,0.4)]" : "ring-black/5"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      {t(`plans.${tier}.name`)}
                    </p>
                    <p className="mt-2 font-display text-[22px] font-bold tracking-tight text-ink">
                      {formatPrice(priceFor(plan))}
                    </p>
                    <p className="mt-0.5 text-[12px] font-medium text-ink-soft">
                      {cycle === "annual" ? t("picker.perYear") : t("picker.perMonth")}
                    </p>
                    <ul className="mt-4 flex-1 space-y-2">
                      {(t.raw(`plans.${tier}.features`) as string[]).map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-[12px] font-semibold text-ink-soft">
                          <span className="material-symbols-outlined text-[15px] text-accent">check_circle</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingPlanId !== null || isCurrentPlan}
                      className={`mt-5 inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-bold transition-all ${
                        isCurrentPlan
                          ? "cursor-default bg-accent/10 text-accent"
                          : "bg-accent text-white shadow-[0_10px_28px_-8px_rgba(0,207,124,0.55)] hover:bg-accent-deep active:scale-[0.98] disabled:opacity-60"
                      }`}
                    >
                      {loadingPlanId === plan.id ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          <span className="ml-2">{t("cta.redirecting")}</span>
                        </>
                      ) : isCurrentPlan ? (
                        t("picker.currentPlan")
                      ) : isGracePeriod ? (
                        t("cta.renewBtn")
                      ) : (
                        t("picker.choose")
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {checkoutError && (
              <p className="mt-4 text-[13px] font-medium text-danger">{checkoutError}</p>
            )}

            {/* Dev Mode quick activation shortcut */}
            {showSubscribeSection && (process.env.NODE_ENV !== "production" || checkoutNotice === "stub") && (
              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
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
          </div>
        </div>

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
