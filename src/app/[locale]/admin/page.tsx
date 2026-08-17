import { getTranslations } from "next-intl/server";
import { getUsersAction } from "@/lib/admin";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";
import { UpdateUserRoleButton } from "@/components/admin/UpdateUserRoleButton";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin");
  const users = await getUsersAction();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminHeader
        eyebrow={t("eyebrow")}
        title={t("users.title")}
        subtitle={t("users.subtitle")}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="overflow-x-auto rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold">{t("users.colUser")}</th>
                <th className="pb-3 font-semibold">{t("users.colRole")}</th>
                <th className="pb-3 font-semibold">{t("users.colJoined")}</th>
                <th className="pb-3 font-semibold">{t("users.colStatus")}</th>
                <th className="pb-3 text-right font-semibold">{t("users.colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-black/[0.02]">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-ink">
                        {user.fullName || t("users.unnamed")}
                      </span>
                      <span className="text-[13px] text-ink-soft">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4"><UpdateUserRoleButton userId={user.id} role={user.role} /></td>
                  <td className="py-4 text-ink-soft">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-4">
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-[12px] font-semibold text-danger">
                          <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
                          {t("users.statusSuspended")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/10 px-2.5 py-1 text-[12px] font-semibold text-positive">
                          <span className="h-1.5 w-1.5 rounded-full bg-positive"></span>
                          {t("users.statusActive")}
                        </span>
                      )}
                  </td>
                  <td className="py-4 text-right">
                    <SuspendUserButton userId={user.id} isSuspended={user.isSuspended} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-soft">
                    {t("users.noUsers")}
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
