import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ToggleTemplateVisibilityButton } from "@/components/admin/ToggleTemplateVisibilityButton";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function TemplatesPage() {
  const t = await getTranslations("Admin");
  const adminClient = createAdminClient();

  // Fetch built-in active templates
  const { data: templates } = await adminClient
    .from("templates")
    .select("id, name, is_active, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("templates.title")}
        subtitle={t("templates.subtitle")}
      />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
        {/* Active Templates Section */}
        <div className="overflow-x-auto rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="font-display text-[16px] font-bold text-ink">{t("templates.activeTitle")}</h2>
            <p className="mt-1 text-[13px] font-medium text-ink-soft">
              {t("templates.activeSubtitle")}
            </p>
          </div>

          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold w-1/2">{t("templates.colName")}</th>
                <th className="pb-3 font-semibold">{t("templates.colRegistry")}</th>
                <th className="pb-3 font-semibold">{t("templates.colStatus")}</th>
                <th className="pb-3 text-right font-semibold">{t("templates.colVisibility")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {templates?.map((tpl) => (
                <tr key={tpl.id} className={`group transition-colors hover:bg-black/[0.02] ${!tpl.is_active ? "opacity-60" : ""}`}>
                  <td className="py-4 font-semibold text-ink">{tpl.name}</td>
                  <td className="py-4 font-mono text-[12px] text-ink-soft">{tpl.id}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                      tpl.is_active
                        ? "bg-positive/10 text-positive"
                        : "bg-ink/[0.05] text-ink-soft"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        tpl.is_active ? "bg-positive" : "bg-ink-faint"
                      }`}></span>
                      {tpl.is_active ? t("templates.statusVisible") : t("templates.statusHidden")}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end">
                      <ToggleTemplateVisibilityButton templateId={tpl.id} isActive={tpl.is_active} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!templates || templates.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-soft">
                    {t("templates.emptyActive")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}