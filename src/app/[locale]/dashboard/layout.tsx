import { redirect } from "@/i18n/navigation";
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
    <div className="relative flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-canvas p-2.5 sm:p-4 md:p-5 font-sans md:gap-4 select-none">
      <DashboardSidebar email={email} contentCounts={contentCounts} />
      <main className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
        {children}
      </main>
    </div>
  );
}