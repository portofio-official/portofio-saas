import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function BlocklistPage() {
  await requireRole(["admin"]);

  // ponytail: minimum viable blocklist read. No CRUD until requested.
  const adminClient = createAdminClient();
  const { data: blocklist } = await adminClient
    .from("subdomain_blocklist")
    .select("slug")
    .order("slug");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-20 shrink-0 items-center border-b border-black/5 px-8">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          Subdomain Blocklist
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="mb-4 text-[14px] text-ink-soft">
            Currently blocked subdomains (manage via database directly for MVP).
          </p>
          <div className="flex flex-wrap gap-2">
            {blocklist?.map((item) => (
              <span
                key={item.slug}
                className="rounded-full bg-black/[0.04] px-3 py-1 text-[13px] font-medium text-ink"
              >
                {item.slug}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
