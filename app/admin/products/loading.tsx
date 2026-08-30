import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function AdminProductsLoading() {
  return (
    <div>
      <div className="bg-muted h-8 w-40 animate-pulse rounded" />
      <div className="mt-6">
        <TableSkeleton />
      </div>
    </div>
  );
}
