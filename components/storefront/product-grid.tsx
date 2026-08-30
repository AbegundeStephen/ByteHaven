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
        <p className="text-foreground font-medium">No products found</p>
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
