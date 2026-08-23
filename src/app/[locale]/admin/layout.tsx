import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/roles";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, email] = await Promise.all([
    getTranslations({ locale, namespace: "Common" }),
    getCurrentUserEmail(),
  ]);

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  try {
    await requireRole(["admin"]);
  } catch {
    return redirect({ href: "/dashboard", locale });
  }

  return (
    <div className="relative flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-canvas font-sans">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-[12px] focus:font-bold focus:text-white"
      >
        {t("skipToContent")}
      </a>
      <AdminSidebar email={email} />
      <main
        id="admin-main-content"
        className="relative flex flex-1 flex-col overflow-hidden border-l border-black/5 bg-canvas"
      >
        {children}
      </main>
    </div>
  );
}