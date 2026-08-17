"use client";

import { useTranslations } from "next-intl";
import type { EditorData } from "./types";

export interface VariantInfo {
  id: string;
  label: string;
  colors: { primary: string; background: string };
}

export interface EditorRightPanelProps {
  activeRightTab: "appearance" | "settings";
  setActiveRightTab: (tab: "appearance" | "settings") => void;
  variants: VariantInfo[];
  data: EditorData;
  setData: React.Dispatch<React.SetStateAction<EditorData>>;
  seo: { title?: string; description?: string; ogImage?: string };
  setSeo: (seo: { title?: string; description?: string; ogImage?: string }) => void;
  siteUrl: string;
  subdomain: string;
  mobileRightOpen: boolean;
  setMobileRightOpen: (open: boolean) => void;
}

export function EditorRightPanel(props: EditorRightPanelProps) {
  const t = useTranslations("Editor");
  const {
    activeRightTab,
    setActiveRightTab,
    variants,
    data,
    setData,
    seo,
    setSeo,
    siteUrl,
    subdomain,
    mobileRightOpen,
    setMobileRightOpen,
  } = props;

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-30 flex w-[280px] shrink-0 flex-col border-l border-black/5 bg-surface shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-out lg:static lg:z-auto ${
        mobileRightOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex h-[52px] shrink-0 items-end px-5 border-b border-black/5 gap-6">
        <button
          onClick={() => setActiveRightTab("appearance")}
          className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
            activeRightTab === "appearance" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          {t("appearance")}
        </button>
        <button
          onClick={() => setActiveRightTab("settings")}
          className={`pb-3 text-[12px] font-bold border-b-2 transition-colors ${
            activeRightTab === "settings" ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          {t("seoSettings")}
        </button>
        <button
          type="button"
          onClick={() => setMobileRightOpen(false)}
          className="lg:hidden ml-auto mb-2.5 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-black/5 hover:text-ink transition-colors"
          aria-label={t("appearance")}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {activeRightTab === "appearance" ? (
          <div className="flex flex-col gap-8 pb-6">
            {/* Appearance Variants Section */}
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-ink">{t("appearance")}</span>

              <div className="flex flex-col gap-3">
                {variants.map((variant) => {
                  const isActive =
                    data.theme?.variantId === variant.id ||
                    (!data.theme?.variantId && variant.id === "default");
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setData((d: EditorData) => ({ ...d, theme: { variantId: variant.id } }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-accent bg-accent/5 ring-1 ring-accent"
                          : "border-black/5 bg-white hover:border-black/15 hover:bg-black/[0.02]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm border border-black/10 overflow-hidden flex">
                        <div className="w-1/2 h-full" style={{ backgroundColor: variant.colors.primary }}></div>
                        <div className="w-1/2 h-full" style={{ backgroundColor: variant.colors.background }}></div>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-bold ${isActive ? "text-accent" : "text-ink"}`}>
                          {variant.label}
                        </span>
                        <span className="text-[11px] text-ink-soft">
                          {isActive ? t("activeVariant") : t("clickToApply")}
                        </span>
                      </div>
                      {isActive && (
                        <span className="material-symbols-outlined text-[18px] text-accent ml-auto">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-6">
            <div>
              <span className="text-[12px] font-bold text-ink">{t("seoSettings")}</span>
              <p className="mt-0.5 text-[11px] text-ink-soft">
                {t("seoHint")}
              </p>
            </div>

            {/* Live search preview */}
            <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-ink-faint">
                {t("searchPreview")}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-[#0b57d0]">{siteUrl}</span>
                <span className="line-clamp-2 text-[14px] font-bold leading-snug text-[#1a0dab]">
                  {seo.title?.trim() || `${data.profile?.fullName || subdomain || "Nama"} · Portofolio`}
                </span>
                <span className="line-clamp-3 text-[12px] leading-snug text-ink-soft">
                  {seo.description?.trim() || data.profile?.headline || "Portofolio profesional."}
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-ink">{t("siteTitle")}</label>
                <input
                  type="text"
                  value={seo.title ?? ""}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                  placeholder="Contoh: Nama kamu · UI/UX Designer"
                  maxLength={100}
                  className="w-full rounded-xl bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                />
                <span className="text-[10px] text-ink-faint">{seo.title?.length ?? 0}/100</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-ink">{t("description")}</label>
                <textarea
                  value={seo.description ?? ""}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  placeholder="Satu-dua kalimat yang menggambarkan kamu dan layananmu."
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-xl bg-canvas px-4 py-3 text-[13px] font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                />
                <span className="text-[10px] text-ink-faint">{seo.description?.length ?? 0}/300</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-ink">{t("socialImageUrl")}</label>
                <input
                  type="url"
                  value={seo.ogImage ?? ""}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  placeholder="https://… (opsional, fallback ke foto profil)"
                  className="w-full rounded-xl bg-canvas px-4 py-2.5 text-[13px] font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <p className="text-[11px] text-ink-soft">
              Perubahan ikut ter-simpan otomatis dan diterapkan ke halaman live setelah Republish.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
