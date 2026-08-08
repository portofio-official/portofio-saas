import { getCurrentUserEmail } from "@/lib/auth/session";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";
import { createClient } from "@/lib/supabase/server";

export default async function TemplatesPage() {
  const email = await getCurrentUserEmail();
  const supabase = await createClient();

  const { data: activeTemplates } = await supabase
    .from("templates")
    .select("id")
    .eq("is_active", true);

  // Fallback (lihat FLOW_CLOSURE_PLAN.md B-2): jika tabel templates kosong
  // (migration belum di-apply remote), jangan saring — tampilkan semua.
  // Kalau tidak, activeTemplateIds=[] akan menghapus SEMUA template dari galeri.
  const activeTemplateIds =
    !activeTemplates || activeTemplates.length === 0
      ? undefined
      : activeTemplates.map((t) => t.id);

  return <TemplateGallery isLoggedIn={!!email} activeTemplateIds={activeTemplateIds} />;
}
