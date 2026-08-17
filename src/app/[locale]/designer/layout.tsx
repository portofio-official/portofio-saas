import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/roles";
import { DesignerSidebar } from "@/components/designer/DesignerSidebar";

export default async function DesignerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();
  if (!email) return redirect({ href: "/login", locale });

  try {
    await requireRole(["designer"]);
  } catch {
    return redirect({ href: "/dashboard", locale });
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-canvas font-sans md:flex-row md:gap-4 md:p-3 lg:gap-6 lg:p-6">
      <DesignerSidebar email={email} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-none bg-surface ring-1 ring-black/5 md:rounded-[2rem] md:shadow-[var(--shadow-diffused)]">
        {children}
      </main>
    </div>
  );
}
