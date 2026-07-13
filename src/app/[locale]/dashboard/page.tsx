import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { listWorkspaces } from "@/lib/workspace/queries";
import { signOutAction } from "@/lib/auth/actions";
import { Eyebrow } from "@/components/ui/CtaButton";
import { FormPanel } from "@/components/ui/FormPanel";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { CreateWorkspaceForm } from "@/components/workspace/CreateWorkspaceForm";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const email = await getCurrentUserEmail();

  if (!email) {
    return redirect({ href: "/login", locale });
  }

  const [workspaces, t] = await Promise.all([listWorkspaces(), getTranslations("Workspace")]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16 md:py-24">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            {t("title")}
          </h1>
          <p className="text-sm text-ink-soft">{email}</p>
        </div>
        <form action={signOutAction}>
          <SubmitButton label={t("logout")} pendingLabel={t("logout")} />
        </form>
      </div>

      {workspaces.length > 0 && (
        <FormPanel eyebrow={t("listEyebrow")} title={t("listTitle")}>
          <div className="flex flex-col gap-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/dashboard/${workspace.id}`}
                className="rounded-2xl p-4 ring-1 ring-black/[0.07] transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-black/20"
              >
                <p className="font-display text-lg font-medium text-ink">{workspace.name}</p>
              </Link>
            ))}
          </div>
        </FormPanel>
      )}

      <FormPanel
        eyebrow={t("create.eyebrow")}
        title={workspaces.length === 0 ? t("create.titleFirst") : t("create.title")}
      >
        <CreateWorkspaceForm />
      </FormPanel>
    </div>
  );
}
