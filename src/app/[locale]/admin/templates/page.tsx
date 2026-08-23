import { getTranslations } from "next-intl/server";
import { getAdminTemplatesAction } from "@/lib/admin";
import { ToggleTemplateVisibilityButton } from "@/components/admin/ToggleTemplateVisibilityButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/primitives";
import { TEMPLATE_CATALOG } from "@/templates/registry";
import { Palette } from "@phosphor-icons/react/dist/ssr";

const ACCENT_BY_ID = new Map<string, string>(TEMPLATE_CATALOG.map((tpl) => [tpl.id, tpl.accentBg]));

export default async function TemplatesPage() {
  const t = await getTranslations("Admin");
  const templates = await getAdminTemplatesAction();

  const activeCount = templates.filter((tpl) => tpl.isActive).length;
  const hiddenCount = templates.length - activeCount;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminPageHeader
        title={t("templates.title")}
        subtitle={t("templates.subtitle")}
        actions={
          <span className="rounded-admin-sm border border-admin-border px-3 py-1 font-mono text-[12px] font-semibold tabular-nums text-admin-ink-soft">
            {t("templates.countSummary", { active: activeCount, hidden: hiddenCount })}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {templates.length === 0 ? (
          <AdminEmptyState icon={Palette} title={t("templates.emptyActive")} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {templates.map((tpl) => {
              const accentBg = ACCENT_BY_ID.get(tpl.id) ?? "bg-admin-ink/[0.08]";
              return (
                <div
                  key={tpl.id}
                  data-testid={`template-card-${tpl.id}`}
                  className={`overflow-hidden rounded-admin-md border border-admin-border ${!tpl.isActive ? "opacity-60" : ""}`}
                >
                  <div className={`relative flex h-28 items-end p-4 ${accentBg}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    <p className="relative font-display text-[17px] font-bold leading-tight text-white">{tpl.name}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-admin-surface p-4">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11px] text-admin-ink-faint">{tpl.id}</p>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1.5 rounded-admin-sm px-2 py-0.5 text-[11px] font-semibold ${
                          tpl.isActive ? "bg-admin-primary-tint text-admin-primary-text" : "bg-admin-ink/[0.05] text-admin-ink-soft"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tpl.isActive ? "bg-admin-primary" : "bg-admin-ink-faint"}`} />
                        {tpl.isActive ? t("templates.statusVisible") : t("templates.statusHidden")}
                      </span>
                    </div>
                    <ToggleTemplateVisibilityButton templateId={tpl.id} isActive={tpl.isActive} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
