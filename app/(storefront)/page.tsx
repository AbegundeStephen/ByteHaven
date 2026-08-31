import Link from "next/link";
import { listCategories } from "@/lib/categories";
import { listProducts } from "@/lib/products";
import { ProductGrid } from "@/components/storefront/product-grid";

export default async function Home() {
  const [categories, newArrivals] = await Promise.all([
    listCategories(),
    listProducts({
      filters: { statuses: ["active"] },
      sort: "newest",
      pageSize: 8,
    }),
  ]);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-12 sm:px-12 sm:py-16">
          <p className="text-accent text-sm font-semibold tracking-wide uppercase">
            Trusted laptop marketplace
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Quality Laptops. Verified Deals. Delivered With Trust.
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-xl">
            Browse new, UK-used, and refurbished laptops with verified specs and
            transparent pricing — pay securely online or coordinate delivery
            directly on WhatsApp.
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className="bg-secondary text-secondary-foreground inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors hover:opacity-90"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-primary text-xl font-bold">Shop by Category</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="border-border bg-card rounded-xl border p-5 text-center transition-shadow hover:shadow-md"
              >
                <p className="text-foreground font-semibold">{category.name}</p>
                {category.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-primary text-xl font-bold">New Arrivals</h2>
          <Link
            href="/shop"
            className="text-secondary text-sm font-medium hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4">
          <ProductGrid products={newArrivals.items} />
        </div>
      </section>
    </div>
  );
}
