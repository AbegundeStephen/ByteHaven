import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { db } from "@/lib/db";
import { ImageGallery } from "@/components/storefront/image-gallery";
import { ConditionBadge } from "@/components/storefront/condition-badge";
import { SpecsTable } from "@/components/storefront/specs-table";
import { ProductGrid } from "@/components/storefront/product-grid";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await db.product.findMany({
    where: { deletedAt: null, status: { in: ["active", "sold_out"] } },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | ByteHaven`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.deletedAt) notFound();

  const related = await getRelatedProducts(product);
  const isSoldOut =
    product.status === "sold_out" || product.stockQuantity === 0;
  const hasDiscount = product.discountPrice !== null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-muted-foreground text-sm">{product.brand}</p>
          <h1 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <ConditionBadge condition={product.condition} />
            <span className="text-muted-foreground text-sm">
              {product.category.name}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-primary text-3xl font-bold">
              {naira.format(Number(product.discountPrice ?? product.price))}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground text-lg line-through">
                {naira.format(Number(product.price))}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-medium">
            {isSoldOut ? (
              <span className="text-destructive">Out of stock</span>
            ) : product.stockQuantity <= 3 ? (
              <span className="text-accent-foreground">
                Only {product.stockQuantity} left in stock
              </span>
            ) : (
              <span className="text-secondary">In stock</span>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              brand={product.brand}
              imageUrl={product.images[0]?.url ?? null}
              unitPrice={Number(product.discountPrice ?? product.price)}
              stockQuantity={product.stockQuantity}
              isSoldOut={isSoldOut}
            />
            {/* WhatsApp "Chat about this product" button ships in Phase 8 */}
          </div>

          <div className="mt-8">
            <h2 className="text-foreground text-sm font-semibold">
              Specifications
            </h2>
            <div className="mt-2">
              <SpecsTable specs={product.specs as Record<string, string>} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-foreground text-sm font-semibold">
              Description
            </h2>
            <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-primary text-xl font-bold">Related products</h2>
          <div className="mt-4">
            <ProductGrid products={related} />
          </div>
        </div>
      )}
    </div>
  );
}
