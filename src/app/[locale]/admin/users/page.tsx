import { getTranslations } from "next-intl/server";
import { getUsersAction } from "@/lib/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { Users } from "@phosphor-icons/react/dist/ssr";

export default async function AdminUsersPage() {
  const t = await getTranslations("Admin");
  const users = await getUsersAction();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AdminPageHeader
        icon={Users}
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
