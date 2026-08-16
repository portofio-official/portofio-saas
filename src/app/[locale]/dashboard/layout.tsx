import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/roles";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { listContentItems } from "@/lib/content/store";
import { redirect as redirectToLocale } from "@/i18n/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Common" });
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const role = await getUserRole();
  if (role === "admin") {
    return redirectToLocale({ href: "/admin", locale });
  }
  if (role !== "user" && role !== "designer") {
    return redirect({ href: "/login", locale });
  }

  // Per-type item counts for the sidebar's Content Library sub-navigation.
  const contentItems = await listContentItems();
  const contentCounts: Record<string, number> = {};
  for (const item of contentItems) {
    contentCounts[item.contentType] = (contentCounts[item.contentType] ?? 0) + 1;
  }

  return (
    <div className="relative flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-canvas font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-[12px] focus:font-bold focus:text-white"
      >
        {t("skipToContent")}
      </a>
      <DashboardSidebar email={email} contentCounts={contentCounts} />
      <main
        id="main-content"
        className="relative flex flex-1 flex-col overflow-hidden border-l border-black/5 bg-surface"
      >
        {children}
      </main>
    </div>
  );
}