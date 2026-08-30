import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function AdminOrdersLoading() {
  return (
    <div>
      <div className="bg-muted h-8 w-32 animate-pulse rounded" />
      <div className="mt-6">
        <TableSkeleton />
      </div>
    </div>
  );
}
