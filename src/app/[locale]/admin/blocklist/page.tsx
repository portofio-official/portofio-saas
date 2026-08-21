import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlocklistClientView } from "@/components/admin/BlocklistClientView";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function BlocklistPage() {
  await requireRole(["admin"]);
  const t = await getTranslations("Admin");

  const adminClient = createAdminClient();
  const { data: blocklist } = await adminClient
    .from("subdomain_blocklist")
    .select("slug")
    .order("slug");

  const slugs = blocklist?.map((b) => b.slug) ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("blocklist.title")}
        subtitle={t("blocklist.subtitle")}
      />

      <BlocklistClientView initialBlocklist={slugs} />
    </div>
  );
}
