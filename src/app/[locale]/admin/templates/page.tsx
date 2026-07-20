import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function TemplatesPage() {
  await requireRole(["admin"]);

  // ponytail: minimum viable template submission read. 
  // No full review UI until Phase 2 actually lands.
  const adminClient = createAdminClient();
  const { data: submissions } = await adminClient
    .from("template_submissions")
    .select(`
      id,
      name,
      status,
      created_at,
      designer:designer_id(raw_user_meta_data)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-20 shrink-0 items-center border-b border-black/5 px-8">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          Template Submissions
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="mb-4 text-[14px] text-ink-soft">
            Review submitted templates from designers (Phase 2 stub).
          </p>

          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold">Template Name</th>
                <th className="pb-3 font-semibold">Designer</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {submissions?.map((sub) => (
                <tr key={sub.id} className="group transition-colors hover:bg-black/[0.02]">
                  <td className="py-4 font-semibold text-ink">{sub.name}</td>
                  <td className="py-4 text-ink-soft">
                    {/* @ts-expect-error - foreign key join raw metadata */}
                    {sub.designer?.raw_user_meta_data?.full_name || "Unknown"}
                  </td>
                  <td className="py-4">
                    <span className="rounded-md bg-black/[0.04] px-2.5 py-1 text-[12px] font-medium capitalize text-ink">
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 text-ink-soft">
                    {new Date(sub.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
              {(!submissions || submissions.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-soft">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
