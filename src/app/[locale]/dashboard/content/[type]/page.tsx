import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listContentItems } from "@/lib/content/store";
import { ContentLibrary } from "@/components/content/ContentLibrary";
import type { ContentType } from "@/lib/content/types";

// The primary content types surfaced in the dashboard sidebar. Case studies
// and gallery remain selectable in the manager but have no sidebar route.
const SIDEBAR_TYPES: ContentType[] = [
  "project",
  "testimonial",
  "certificate",
  "experience",
  "education",
  "publication",
  "media",
];

// Auth-gated page (reads the session) — never prerender statically.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  const t = await getTranslations({ locale, namespace: "ContentLibrary" });
  return { title: `${t("title")} — ${t(`types.${type}`)}` };
}

export default async function DashboardContentTypePage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;

  if (!SIDEBAR_TYPES.includes(type as ContentType)) {
    return redirect({ href: "/dashboard/content", locale });
  }

  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const items = await listContentItems();

  return <ContentLibrary initialItems={items} initialType={type as ContentType} />;
}