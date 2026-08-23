"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminUserView } from "@/lib/admin/actions";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";
import { UpdateUserRoleButton } from "@/components/admin/UpdateUserRoleButton";
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
    <div className="overflow-x-auto rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="admin-user-search">
          {t("users.searchLabel")}
        </label>
        <div className="flex w-full items-center gap-2 rounded-xl bg-shell px-3 py-2 ring-1 ring-black/10 transition focus-within:ring-2 focus-within:ring-accent sm:max-w-sm">
          <MagnifyingGlass aria-hidden="true" size={18} className="shrink-0 text-ink-faint" />
          <input
            id="admin-user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("users.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={t("users.clearSearch")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-black/5 hover:text-ink active:scale-95"
            >
              <X aria-hidden="true" size={16} />
            </button>
          )}
        </div>
      </div>

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
          {filteredUsers.map((user) => (
            <tr key={user.id} className="group transition-colors hover:bg-black/[0.02]">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-deep">
                    <UserCircle weight="duotone" size={20} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-ink">{user.fullName || t("users.unnamed")}</span>
                    <span className="truncate text-[13px] text-ink-soft">{user.email}</span>
                  </div>
                </div>
              </td>
              <td className="py-4"><UpdateUserRoleButton userId={user.id} role={user.role} /></td>
              <td className="py-4 font-mono text-[13px] tabular-nums text-ink-soft">
                {new Date(user.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="py-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${user.isSuspended ? "bg-danger/10 text-danger" : "bg-positive/10 text-positive"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${user.isSuspended ? "bg-danger" : "bg-positive"}`} />
                  {user.isSuspended ? t("users.statusSuspended") : t("users.statusActive")}
                </span>
              </td>
              <td className="py-4 text-right"><SuspendUserButton userId={user.id} isSuspended={user.isSuspended} /></td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-ink-soft">
                {search ? t("users.noSearchResults", { search }) : t("users.noUsers")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
