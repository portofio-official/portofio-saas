import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ToggleTemplateVisibilityButton } from "@/components/admin/ToggleTemplateVisibilityButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TEMPLATE_CATALOG } from "@/templates/registry";
import { Palette } from "@phosphor-icons/react/dist/ssr";

const ACCENT_BY_ID = new Map(TEMPLATE_CATALOG.map((tpl) => [tpl.id, tpl.accentBg]));

export default async function TemplatesPage() {
  const t = await getTranslations("Admin");
  const adminClient = createAdminClient();

  // Fetch built-in active templates
  const { data: templates } = await adminClient
    .from("templates")
    .select("id, name, is_active, created_at")
    .order("created_at", { ascending: true });

  const activeCount = templates?.filter((tpl) => tpl.is_active).length ?? 0;
  const hiddenCount = (templates?.length ?? 0) - activeCount;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminPageHeader
        icon={Palette}
        tone="bg-info-soft text-info"
        eyebrow={t("eyebrow")}
        title={t("templates.title")}
        subtitle={t("templates.subtitle")}
        actions={
          <span className="rounded-full bg-ink/[0.05] px-3 py-1 font-mono text-[12px] font-semibold tabular-nums text-ink-soft">
            {t("templates.countSummary", { active: activeCount, hidden: hiddenCount })}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <p className="mb-4 text-[13px] font-medium text-ink-soft">{t("templates.activeSubtitle")}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {templates?.map((tpl) => {
            const accentBg = ACCENT_BY_ID.get(tpl.id) ?? "bg-ink/[0.08]";
            return (
              <div
                key={tpl.id}
                data-testid={`template-card-${tpl.id}`}
                className={`group overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md ${
                  !tpl.is_active ? "opacity-60" : ""
                }`}
              >
                <div className={`relative flex h-28 items-end p-4 ${accentBg}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <p className="relative font-display text-[17px] font-bold leading-tight text-white">
                    {tpl.name}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 bg-surface p-4">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-ink-faint">{tpl.id}</p>
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        tpl.is_active ? "bg-positive/10 text-positive" : "bg-ink/[0.05] text-ink-soft"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${tpl.is_active ? "bg-positive" : "bg-ink-faint"}`} />
                      {tpl.is_active ? t("templates.statusVisible") : t("templates.statusHidden")}
                    </span>
                  </div>
                  <ToggleTemplateVisibilityButton templateId={tpl.id} isActive={tpl.is_active} />
                </div>
              </div>
            );
          })}
          {(!templates || templates.length === 0) && (
            <p className="col-span-full py-8 text-center text-ink-soft">{t("templates.emptyActive")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
