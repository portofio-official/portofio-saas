"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { CustomDomainStatus, DnsInstruction } from "@/lib/domains/types";

interface CustomDomainCardProps {
  hasCustomDomainEntitlement: boolean;
  projectId: string | null;
  existingDomain: string | null;
  existingStatus: CustomDomainStatus | null;
}

export function CustomDomainCard({
  hasCustomDomainEntitlement,
  projectId,
  existingDomain,
  existingStatus,
}: CustomDomainCardProps) {
  const t = useTranslations("Billing.domain");
  const router = useRouter();
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<DnsInstruction[] | null>(null);

  if (!hasCustomDomainEntitlement) {
    return (
      <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5">
        <div className="rounded-[1.4rem] bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <p className="font-display text-[15px] font-bold text-ink">{t("title")}</p>
          <p className="mt-1 text-[13px] text-ink-soft">{t("upsell")}</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5">
        <div className="rounded-[1.4rem] bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <p className="font-display text-[15px] font-bold text-ink">{t("title")}</p>
          <p className="mt-1 text-[13px] text-ink-soft">{t("noProject")}</p>
        </div>
      </div>
    );
  }

  async function handleAdd() {
    setLoading(true);
    setError(null);
    try {
      const { addCustomDomainAction } = await import("@/lib/domains/actions");
      const res = await addCustomDomainAction(projectId!, domainInput);
      if (res.ok) {
        setInstructions(res.verification ?? []);
        router.refresh();
      } else {
        setError(res.error === "custom_domain_requires_upgrade" ? t("upsell") : (res.error ?? t("errors.generic")));
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const { checkCustomDomainStatusAction } = await import("@/lib/domains/actions");
      const res = await checkCustomDomainStatusAction(projectId!);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? t("errors.generic"));
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    setError(null);
    try {
      const { removeCustomDomainAction } = await import("@/lib/domains/actions");
      const res = await removeCustomDomainAction(projectId!);
      if (res.ok) {
        setInstructions(null);
        router.refresh();
      } else {
        setError(res.error ?? t("errors.generic"));
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-black/[0.02] p-1.5 ring-1 ring-black/5">
      <div className="rounded-[1.4rem] bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <p className="font-display text-[15px] font-bold text-ink">{t("title")}</p>
        <p className="mt-1 text-[13px] text-ink-soft">{t("subtitle")}</p>

        {existingDomain ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-shell px-4 py-3 ring-1 ring-black/5">
            <span className="material-symbols-outlined text-[18px] text-ink-soft">language</span>
            <span className="font-mono text-[13px] font-semibold text-ink">{existingDomain}</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                existingStatus === "verified"
                  ? "bg-accent/10 text-accent"
                  : "bg-warning-soft text-ink"
              }`}
            >
              {existingStatus === "verified" ? t("status.verified") : t("status.pending")}
            </span>
            <div className="ml-auto flex gap-2">
              {existingStatus !== "verified" && (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={loading}
                  className="rounded-full bg-black/5 px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-black/10 disabled:opacity-50"
                >
                  {t("checkBtn")}
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="rounded-full bg-danger/10 px-3 py-1.5 text-[12px] font-bold text-danger transition-colors hover:bg-danger/15 disabled:opacity-50"
              >
                {t("removeBtn")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="namamu.com"
              className="h-10 flex-1 rounded-lg bg-shell px-3.5 text-[13px] font-medium text-ink ring-1 ring-black/10 outline-none transition focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading || !domainInput.trim()}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-accent-deep active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? t("adding") : t("addBtn")}
            </button>
          </div>
        )}

        {instructions && instructions.length > 0 && (
          <div className="mt-4 rounded-xl bg-info-soft px-4 py-3.5 ring-1 ring-info/30">
            <p className="text-[12px] font-bold text-ink">{t("dnsTitle")}</p>
            <div className="mt-2 space-y-1.5 overflow-x-auto">
              {instructions.map((rec, i) => (
                <div key={i} className="font-mono text-[11px] text-ink-soft">
                  {rec.type} · {rec.name} → {rec.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-[13px] font-medium text-danger">{error}</p>}
      </div>
    </div>
  );
}
