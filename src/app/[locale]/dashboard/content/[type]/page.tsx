import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listContentItems } from "@/lib/content/store";
import { ContentLibrary } from "@/components/content/ContentLibrary";
import type { ContentType } from "@/lib/content";

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

const TYPE_ALIASES: Record<string, ContentType> = {
  projects: "project",
  testimonials: "testimonial",
  certificates: "certificate",
  publications: "publication",
};

function normalizeContentType(type: string): ContentType | null {
  if (SIDEBAR_TYPES.includes(type as ContentType)) return type as ContentType;
  return TYPE_ALIASES[type] ?? null;
}

// Auth-gated page (reads the session) — never prerender statically.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  const t = await getTranslations({ locale, namespace: "ContentLibrary" });
  const contentType = normalizeContentType(type);
  return { title: `${t("title")} — ${t(`types.${contentType ?? "project"}`)}` };
}

export default async function DashboardContentTypePage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;

  const contentType = normalizeContentType(type);
  if (!contentType) {
    return redirect({ href: "/dashboard/content", locale });
  }

  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const items = await listContentItems();

  return <ContentLibrary initialItems={items} initialType={contentType} />;
}
