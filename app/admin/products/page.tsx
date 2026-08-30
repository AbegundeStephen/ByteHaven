import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/categories";
import { listProducts } from "@/lib/products";
import { ProductTable } from "@/components/admin/product-table";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const [categories, initialResult] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 20 }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the product catalog.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          New product
        </Link>
      </div>

      <div className="mt-6">
        <ProductTable
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          initialResult={JSON.parse(JSON.stringify(initialResult))}
        />
      </div>
    </div>
  );
}
