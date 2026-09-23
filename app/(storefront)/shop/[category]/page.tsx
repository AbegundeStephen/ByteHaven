import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listCategories } from "@/lib/categories";
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

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<ShopSearchParams>;
}

export async function generateStaticParams() {
  const categories = await listCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} at AkinStore — verified pricing and specs.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const resolvedSearchParams = await searchParams;
  const { filters, sort, page } = parseShopSearchParams(
    resolvedSearchParams,
    slug,
  );

  const [categories, brands, result] = await Promise.all([
    listCategories(),
    listBrands(),
    listProducts({ filters, sort, page, pageSize: 24 }),
  ]);

  const flatParams: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : v,
    ]),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-primary text-2xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mt-1 text-sm">
          {category.description}
        </p>
      )}
      <p className="text-muted-foreground mt-1 text-sm">
        {result.total} product{result.total === 1 ? "" : "s"} found
      </p>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <ShopFilters
          categories={categories}
          brands={brands}
          lockedCategorySlug={slug}
        />

        <div className="flex-1">
          <div className="mb-4 flex justify-end">
            <SortSelect />
          </div>
          <ProductGrid products={result.items} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath={`/shop/${slug}`}
            searchParams={flatParams}
          />
        </div>
      </div>
    </div>
  );
}
