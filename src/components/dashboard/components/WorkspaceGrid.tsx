"use client";

import type { Workspace } from "@/lib/workspace";
import { WorkspaceCard } from "./WorkspaceCard";
import { CreateWorkspaceCard } from "./CreateWorkspaceCard";

export interface WorkspaceGridProps {
  workspaces: Workspace[];
  locale: string;
  recentViews: Map<string, number>;
  onPreview: (workspace: Workspace) => void;
  onDuplicate: (workspaceId: string) => void;
  isDuplicating: string | null;
  onUnpublish: (workspaceId: string) => void;
  onDelete: (workspace: Workspace) => void;
}

export function WorkspaceGrid({
  workspaces,
  locale,
  recentViews,
  onPreview,
  onDuplicate,
  isDuplicating,
  onUnpublish,
  onDelete,
}: WorkspaceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-6">
      {workspaces.map((workspace, index) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          locale={locale}
          index={index}
          recentViews={recentViews}
          onPreview={onPreview}
          onDuplicate={onDuplicate}
          isDuplicating={isDuplicating === workspace.id}
          onUnpublish={onUnpublish}
          onDelete={onDelete}
        />
      ))}

      <CreateWorkspaceCard index={workspaces.length} />
    </div>
  );
}
