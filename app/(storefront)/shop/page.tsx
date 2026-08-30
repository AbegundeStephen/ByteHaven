import type { Metadata } from "next";
import { listCategories } from "@/lib/categories";
import {
  listBrands,
  listProducts,
  parseShopSearchParams,
  type ShopSearchParams,
} from "@/lib/products";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { SortSelect } from "@/components/storefront/sort-select";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Pagination } from "@/components/storefront/pagination";

export const metadata: Metadata = {
  title: "Shop All Products | ByteHaven",
  description:
    "Browse laptops and laptop accessories at ByteHaven — new, UK-used, and refurbished, with verified pricing and specs.",
};

interface ShopPageProps {
  searchParams: Promise<ShopSearchParams>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { filters, sort, page } = parseShopSearchParams(params);

  const [categories, brands, result] = await Promise.all([
    listCategories(),
    listBrands(),
    listProducts({ filters, sort, page, pageSize: 24 }),
  ]);

  const flatParams: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-primary text-2xl font-bold">Shop All Products</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {result.total} product{result.total === 1 ? "" : "s"} found
      </p>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <ShopFilters categories={categories} brands={brands} />

        <div className="flex-1">
          <div className="mb-4 flex justify-end">
            <SortSelect />
          </div>
          <ProductGrid products={result.items} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/shop"
            searchParams={flatParams}
          />
        </div>
      </div>
    </div>
  );
}
