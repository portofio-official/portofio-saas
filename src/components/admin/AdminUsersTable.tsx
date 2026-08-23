"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminUserView } from "@/lib/admin/actions";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";
import { UpdateUserRoleButton } from "@/components/admin/UpdateUserRoleButton";
import { AdminCard, AdminBadge, AdminEmptyState } from "@/components/admin/primitives";
import { MagnifyingGlass, X, UserCircle } from "@phosphor-icons/react/dist/ssr";

export function AdminUsersTable({ users }: { users: AdminUserView[] }) {
  const t = useTranslations("Admin");
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        [user.fullName, user.email, user.role]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch)),
      ),
    [normalizedSearch, users],
  );

  return (
    <AdminCard className="overflow-x-auto p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="admin-user-search">
          {t("users.searchLabel")}
        </label>
        <div className="flex h-11 w-full items-center gap-2 rounded-admin-sm border border-admin-border px-3 transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-admin-primary sm:max-w-sm">
          <MagnifyingGlass aria-hidden="true" size={18} className="shrink-0 text-admin-ink-faint" />
          <input
            id="admin-user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("users.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-admin-ink outline-none placeholder:text-admin-ink-faint"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={t("users.clearSearch")}
              className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-admin-sm text-admin-ink-faint transition-colors hover:bg-admin-ink/5 hover:text-admin-ink"
            >
              <X aria-hidden="true" size={16} />
            </button>
          )}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <AdminEmptyState
          title={search ? t("users.noSearchResults", { search }) : t("users.noUsers")}
        />
      ) : (
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-admin-border text-admin-ink-faint">
              <th className="pb-3 text-[12px] font-semibold uppercase tracking-wide">{t("users.colUser")}</th>
              <th className="pb-3 text-[12px] font-semibold uppercase tracking-wide">{t("users.colRole")}</th>
              <th className="pb-3 text-[12px] font-semibold uppercase tracking-wide">{t("users.colJoined")}</th>
              <th className="pb-3 text-[12px] font-semibold uppercase tracking-wide">{t("users.colStatus")}</th>
              <th className="pb-3 text-right text-[12px] font-semibold uppercase tracking-wide">{t("users.colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-admin-ink/[0.02]">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-primary-tint text-admin-primary-text">
                      <UserCircle weight="duotone" size={20} />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-admin-ink">{user.fullName || t("users.unnamed")}</span>
                      <span className="truncate text-[13px] text-admin-ink-soft">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3"><UpdateUserRoleButton userId={user.id} role={user.role} /></td>
                <td className="py-3 font-mono text-[13px] tabular-nums text-admin-ink-soft">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3">
                  <AdminBadge tone={user.isSuspended ? "rose" : "positive"}>
                    {user.isSuspended ? t("users.statusSuspended") : t("users.statusActive")}
                  </AdminBadge>
                </td>
                <td className="py-3 text-right"><SuspendUserButton userId={user.id} isSuspended={user.isSuspended} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminCard>
  );
}
