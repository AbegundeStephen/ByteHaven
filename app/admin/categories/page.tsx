import type { Metadata } from "next";
import { listCategoriesWithProductCount } from "@/lib/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesWithProductCount();

  return (
    <div>
      <h1 className="text-primary text-2xl font-bold">Categories</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Create, rename, reorder, and delete product categories.
      </p>

      <div className="mt-6">
        <CategoryManager
          initialCategories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            sortOrder: c.sortOrder,
            productCount: c._count.products,
          }))}
        />
      </div>
    </div>
  );
}
