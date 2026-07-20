import { getUsersAction } from "@/lib/admin/actions";
import { SuspendUserButton } from "@/components/admin/SuspendUserButton";

export default async function AdminDashboardPage() {
  const users = await getUsersAction();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-black/5 px-8">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
            Users
          </h1>
          <p className="text-[14px] text-ink-soft">
            Manage platform users and moderation
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Joined</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-black/[0.02]">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-ink">
                        {user.fullName || "Unnamed User"}
                      </span>
                      <span className="text-[13px] text-ink-soft">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="rounded-md bg-black/[0.04] px-2.5 py-1 text-[12px] font-medium capitalize text-ink">
                      {user.role}
                    </span>
                  </td>
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
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/10 px-2.5 py-1 text-[12px] font-semibold text-positive">
                        <span className="h-1.5 w-1.5 rounded-full bg-positive"></span>
                        Active
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
                    No users found.
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
