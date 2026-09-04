import Link from "next/link";
import { listCategories } from "@/lib/categories";
import { listProducts } from "@/lib/products";
import { ProductGrid } from "@/components/storefront/product-grid";

const TRUST_POINTS = [
  { label: "Verified condition on every listing" },
  { label: "Secure checkout via Paystack" },
  { label: "Real human support on WhatsApp" },
];

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
        <div className="from-primary via-primary relative overflow-hidden rounded-2xl bg-gradient-to-br to-[#0a1e3d] px-6 py-12 sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="bg-secondary absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="bg-accent absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-10 blur-3xl"
          />

          <div className="relative">
            <p className="text-accent text-sm font-semibold tracking-wide uppercase">
              Trusted laptop marketplace
            </p>
            <h1 className="text-primary-foreground mt-3 max-w-2xl text-4xl leading-[1.1] font-bold tracking-tight sm:text-6xl">
              Quality Laptops. Verified Deals. Delivered With Trust.
            </h1>
            <p className="text-primary-foreground/80 mt-5 max-w-xl text-base sm:text-lg">
              Browse new, UK-used, and refurbished laptops with verified specs
              and transparent pricing — pay securely online or coordinate
              delivery directly on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="bg-secondary text-secondary-foreground inline-flex h-12 items-center justify-center rounded-lg px-7 text-sm font-semibold shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
              >
                Browse Shop
              </Link>
              <Link
                href="/track-order"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 inline-flex h-12 items-center justify-center rounded-lg border px-7 text-sm font-semibold backdrop-blur-sm transition-colors"
              >
                Track an Order
              </Link>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6">
              {TRUST_POINTS.map((point) => (
                <div key={point.label} className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="text-accent h-4 w-4 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.006l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.797 2.796 6.79-6.89a1 1 0 0 1 1.413-.012Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <dd className="text-primary-foreground/85 text-sm">
                    {point.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-primary text-xl font-bold sm:text-2xl">
            Shop by Category
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group border-border bg-card relative overflow-hidden rounded-xl border p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  aria-hidden="true"
                  className="from-secondary to-accent absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-300 group-hover:scale-x-100"
                />
                <p className="text-foreground group-hover:text-secondary font-semibold transition-colors">
                  {category.name}
                </p>
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

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-primary text-xl font-bold sm:text-2xl">
            New Arrivals
          </h2>
          <Link
            href="/shop"
            className="text-secondary group inline-flex items-center gap-1 text-sm font-medium"
          >
            View all
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
        <div className="mt-5">
          <ProductGrid products={newArrivals.items} />
        </div>
      </section>
    </div>
  );
}
