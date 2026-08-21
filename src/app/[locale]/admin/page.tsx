import { getTranslations } from "next-intl/server";
import { getUsersAction } from "@/lib/admin";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin");
  const users = await getUsersAction();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("users.title")}
        subtitle={t("users.subtitle")}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <AdminUsersTable users={users} />
      </div>
    </div>
  );
}
