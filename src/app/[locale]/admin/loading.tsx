import { AdminSkeleton } from "@/components/admin/primitives";

export default function AdminLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-admin-border bg-admin-surface px-6 py-5 sm:px-8">
        <AdminSkeleton className="h-6 w-40" />
        <AdminSkeleton className="mt-2 h-4 w-64 max-w-full" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminSkeleton className="h-[220px] lg:col-span-2" />
          <div className="flex flex-col gap-4">
            <AdminSkeleton className="h-[102px]" />
            <AdminSkeleton className="h-[102px]" />
          </div>
        </div>
        <div className="mt-4 rounded-admin-md border border-admin-border p-5">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <AdminSkeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
