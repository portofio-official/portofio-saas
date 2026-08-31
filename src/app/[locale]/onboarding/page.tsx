import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listWorkspaces } from "@/lib/workspace/queries";
import { getUserProfile } from "@/lib/profile/queries";
import { OnboardingClientView } from "@/components/onboarding/OnboardingClientView";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();
  const cookieStore = await cookies();
  const preferredTemplateId = cookieStore.get("preferredTemplateId")?.value;

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const [workspaces, profile, t, tSettings] = await Promise.all([
    listWorkspaces(), 
    getUserProfile(),
    getTranslations("Onboarding"),
    getTranslations("Profile")
  ]);

  if (workspaces.length > 0) {
    // [DEV BYPASS] Temporarily commented out to allow designing the onboarding page
    // return redirect({ href: "/dashboard", locale });
  }

  // [DEV BYPASS] Force hasProfile to false so the user can always see Step 1 of onboarding.
  const hasProfile = false; // Boolean(profile?.full_name);

  return (
    <OnboardingClientView
      preferredTemplateId={preferredTemplateId}
      hasProfile={hasProfile}
      dict={{
        eyebrow: t("eyebrow"),
        title: t("title"),
        subtitle: t("subtitle"),
        testimonial: t("testimonial"),
      }}
      settingsDict={{
        eyebrow: tSettings("eyebrow"),
        title: tSettings("title"),
        subtitle: tSettings("subtitle"),
        fullNameLabel: tSettings("fullNameLabel"),
        fullNamePlaceholder: tSettings("fullNamePlaceholder"),
        save: tSettings("save"),
        saving: tSettings("saving"),
      }}
    />
  );
}
