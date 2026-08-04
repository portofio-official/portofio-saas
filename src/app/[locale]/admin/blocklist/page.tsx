import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlocklistClientView } from "@/components/admin/BlocklistClientView";

export default async function BlocklistPage() {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  const { data: blocklist } = await adminClient
    .from("subdomain_blocklist")
    .select("slug")
    .order("slug");

  const slugs = blocklist?.map((b) => b.slug) ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-50 flex h-20 shrink-0 items-center border-b border-black/5 bg-surface/80 px-8 backdrop-blur-md">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          Subdomain Blocklist
        </h1>
      </header>

      <BlocklistClientView initialBlocklist={slugs} />
    </div>
  );
}
