import type { Metadata } from "next";
import { listCategories } from "@/lib/categories";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="text-primary text-2xl font-bold">New product</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Add a new laptop or accessory to the catalog.
      </p>
      <div className="mt-6 max-w-3xl">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
