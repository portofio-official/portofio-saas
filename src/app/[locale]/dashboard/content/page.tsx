import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listWorkspaces } from "@/lib/workspace/queries";

export default async function DashboardContentHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();
  void cookies();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const [workspaces, t] = await Promise.all([listWorkspaces(), getTranslations("ContentLibrary")]);

  if (workspaces.length === 0) {
    return redirect({ href: "/onboarding", locale });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <header className="flex shrink-0 flex-col gap-4 border-b border-[#E5E7EB] bg-white px-8 py-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#111827]">{t("title")}</h1>
          <p className="mt-1 text-[12px] font-medium text-[#6B7280]">{t("subtitle")}</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-md"
            >
              <div className="flex h-32 items-center justify-center bg-[#F9FAFB]">
                <span className="material-symbols-outlined text-[36px] text-[#C0C8D4]">folder_open</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="truncate text-[14px] font-semibold text-[#111827]">{workspace.name}</p>
                {workspace.publishStatus === "published" && workspace.subdomain && (
                  <p className="mt-1 truncate text-[11px] font-medium text-[#00b368]">
                    {workspace.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000"}
                  </p>
                )}
                <div className="mt-auto flex items-center pt-3">
                  <Link
                    href={`/dashboard/${workspace.id}/content`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#00cf7c] px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_4px_10px_0_rgba(0,207,124,0.3)] transition-all hover:bg-[#00b368]"
                  >
                    <span className="material-symbols-outlined text-[14px]">folder_open</span>
                    {t("openLibrary")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}