import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewTemplateDropdown } from "@/components/admin/ReviewTemplateDropdown";
import { ToggleTemplateVisibilityButton } from "@/components/admin/ToggleTemplateVisibilityButton";

export default async function TemplatesPage() {
  await requireRole(["admin"]);

  const adminClient = createAdminClient();
  
  // Fetch built-in active templates
  const { data: templates } = await adminClient
    .from("templates")
    .select("id, name, is_active, created_at")
    .order("created_at", { ascending: true });

  // Fetch submissions (Phase 2 stub)
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
      <header className="sticky top-0 z-50 flex h-20 shrink-0 items-center border-b border-black/5 bg-surface/80 px-8 backdrop-blur-md">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          Template Management
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        {/* Active Templates Section */}
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-ink">Active Built-in Templates</h2>
            <p className="text-[14px] text-ink-soft">
              Manage which built-in templates are visible to users in the galleries.
            </p>
          </div>

          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold w-1/2">Template Name</th>
                <th className="pb-3 font-semibold">Registry ID</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {templates?.map((tpl) => (
                <tr key={tpl.id} className={`group transition-colors hover:bg-black/[0.02] ${!tpl.is_active ? "opacity-60" : ""}`}>
                  <td className="py-4 font-semibold text-ink">{tpl.name}</td>
                  <td className="py-4 font-mono text-[12px] text-ink-soft">{tpl.id}</td>
                  <td className="py-4">
                    <span className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${
                      tpl.is_active 
                        ? "bg-positive/10 text-positive" 
                        : "bg-black/5 text-ink-soft"
                    }`}>
                      {tpl.is_active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end">
                      <ToggleTemplateVisibilityButton templateId={tpl.id} isActive={tpl.is_active} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!templates || templates.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-soft">
                    No built-in templates found. Run the database migration.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Submissions Section */}
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-ink">Community Submissions</h2>
            <p className="text-[14px] text-ink-soft">
              Review submitted templates from designers (Phase 2 stub).
            </p>
          </div>

          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5 text-ink-faint">
                <th className="pb-3 font-semibold">Template Name</th>
                <th className="pb-3 font-semibold">Designer</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Submitted Date</th>
                <th className="pb-3 text-right font-semibold">Action</th>
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
                  <td className="py-4 text-right">
                    <ReviewTemplateDropdown submissionId={sub.id} />
                  </td>
                </tr>
              ))}
              {(!submissions || submissions.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-soft">
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
