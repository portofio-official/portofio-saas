import { getTranslations } from "next-intl/server";
import { getAdminAuditLogsAction } from "@/lib/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";

function formatMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata).filter(([key]) => key !== "outcome");
  if (entries.length === 0) return "-";
  return entries
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" · ");
}

export default async function AdminAuditLogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, logs] = await Promise.all([
    getTranslations("Admin"),
    getAdminAuditLogsAction(),
  ]);
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminHeader
        eyebrow={t("eyebrow")}
        title={t("audit.title")}
        subtitle={t("audit.subtitle")}
      />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="overflow-x-auto rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold">{t("audit.time")}</th>
                <th className="pb-3 font-semibold">{t("audit.action")}</th>
                <th className="pb-3 font-semibold">{t("audit.target")}</th>
                <th className="pb-3 font-semibold">{t("audit.details")}</th>
                <th className="pb-3 font-semibold">{t("audit.actor")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {logs.map((log) => (
                <tr key={log.id} className="align-top transition-colors hover:bg-black/[0.02]">
                  <td className="whitespace-nowrap py-4 text-ink-soft">{formatter.format(new Date(log.createdAt))}</td>
                  <td className="py-4 font-semibold text-ink">{log.action}</td>
                  <td className="py-4 text-ink-soft">
                    <span className="font-medium text-ink">{log.targetType}</span>
                    {log.targetId && <span className="ml-1 font-mono text-[11px]">{log.targetId}</span>}
                  </td>
                  <td className="max-w-[420px] py-4 text-ink-soft">{formatMetadata(log.metadata)}</td>
                  <td className="py-4 font-mono text-[11px] text-ink-faint">{log.actorId ?? "-"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-soft">{t("audit.empty")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
