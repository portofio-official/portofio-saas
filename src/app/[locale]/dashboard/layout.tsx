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
    <div className="relative flex h-dvh w-full overflow-hidden bg-canvas p-3 font-sans sm:p-5 sm:gap-4">
      {/* Ambient canvas lighting — kept behind every panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[18%] h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-6rem] left-[16%] h-72 w-72 rounded-full bg-[#7c9bff]/[0.07] blur-3xl"
      />

      <DashboardSidebar email={email} contentCounts={contentCounts} />
      <main className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
        {children}
      </main>
    </div>
  );
}
