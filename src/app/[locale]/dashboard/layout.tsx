import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/roles";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { listContentItems } from "@/lib/content/store";
import { getSubscriptionState } from "@/lib/billing/subscription";
import { redirect as redirectToLocale } from "@/i18n/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

  const sub = await getSubscriptionState();
  const isPremium = sub.isActive && !sub.isGracePeriod;

  return (
    <SidebarProvider>
      <div className="relative flex min-h-svh w-full overflow-hidden bg-canvas font-sans">
        {/* Ambient canvas lighting — kept behind every panel */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[18%] h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-6rem] left-[16%] h-72 w-72 rounded-full bg-[#7c9bff]/[0.07] blur-3xl"
        />

        <DashboardSidebar email={email} contentCounts={contentCounts} isPremium={isPremium} />

        <SidebarInset>
          {/* Mobile-only sidebar trigger, floating over the content header */}
          <div className="pointer-events-none fixed z-40 top-3 left-3 md:hidden">
            <div className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-ink shadow-md ring-1 ring-black/5">
              <SidebarTrigger />
            </div>
          </div>
          <main className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
