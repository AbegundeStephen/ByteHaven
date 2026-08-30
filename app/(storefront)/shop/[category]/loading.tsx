import { ProductGridSkeleton } from "@/components/storefront/product-grid-skeleton";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-muted h-8 w-64 animate-pulse rounded" />
      <div className="bg-muted mt-2 h-4 w-40 animate-pulse rounded" />
      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="bg-muted h-96 animate-pulse rounded-xl" />
        </div>
        <div className="flex-1">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
