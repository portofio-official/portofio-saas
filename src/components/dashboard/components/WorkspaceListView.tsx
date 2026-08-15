"use client";

import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/workspace/types";
import { WorkspaceListItem } from "./WorkspaceListItem";

export interface WorkspaceListViewProps {
  workspaces: Workspace[];
  locale: string;
  onPreview: (workspace: Workspace) => void;
  onDuplicate: (workspaceId: string) => void;
  isDuplicating: string | null;
  onUnpublish: (workspaceId: string) => void;
  onDelete: (workspace: Workspace) => void;
}

export function WorkspaceListView({
  workspaces,
  locale,
  onPreview,
  onDuplicate,
  isDuplicating,
  onUnpublish,
  onDelete,
}: WorkspaceListViewProps) {
  const t = useTranslations("Dashboard");

  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5 pb-6">
      {/* Desktop Table View (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-black/5 bg-shell/70 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              <th className="px-6 py-3.5">{t("colName")}</th>
              <th className="px-6 py-3.5">{t("colStatus")}</th>
              <th className="px-6 py-3.5">{t("colDomain")}</th>
              <th className="px-6 py-3.5">{t("colLastEdited")}</th>
              <th className="px-6 py-3.5 text-right">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {workspaces.map((workspace) => (
              <WorkspaceListItem
                key={workspace.id}
                workspace={workspace}
                locale={locale}
                onPreview={onPreview}
                onDuplicate={onDuplicate}
                isDuplicating={isDuplicating === workspace.id}
                onUnpublish={onUnpublish}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="flex flex-col divide-y divide-black/5 md:hidden">
        {workspaces.map((workspace) => (
          <WorkspaceListItem
            key={workspace.id}
            workspace={workspace}
            locale={locale}
            onPreview={onPreview}
            onDuplicate={onDuplicate}
            isDuplicating={isDuplicating === workspace.id}
            onUnpublish={onUnpublish}
            onDelete={onDelete}
            isMobileView
          />
        ))}
      </div>
    </div>
  );
}
