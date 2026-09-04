import type { ProductWithRelations } from "@/lib/products";
import { ProductCard } from "@/components/storefront/product-card";

export function ProductGrid({
  products,
}: {
  products: ProductWithRelations[];
}) {
  if (products.length === 0) {
    return (
      <div className="border-border rounded-xl border border-dashed p-12 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="text-muted-foreground mx-auto h-10 w-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <p className="text-foreground mt-3 font-medium">No products found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
