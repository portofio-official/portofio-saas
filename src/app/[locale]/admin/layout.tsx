import { redirect } from "@/i18n/navigation";
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
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  try {
    await requireRole(["admin"]);
  } catch {
    return redirect({ href: "/dashboard", locale });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface p-6 gap-6 font-sans">
      <AdminSidebar email={email} />
      <main className="flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-diffused)] ring-1 ring-black/5">
        {children}
      </main>
    </div>
  );
}
