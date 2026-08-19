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
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas font-sans md:flex-row">
      <DesignerSidebar email={email} />
      <main id="main-content" className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-l border-black/5 bg-surface">
        {children}
      </main>
    </div>
  );
}
