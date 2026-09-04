import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { db } from "@/lib/db";
import { ImageGallery } from "@/components/storefront/image-gallery";
import { ConditionBadge } from "@/components/storefront/condition-badge";
import { SpecsTable } from "@/components/storefront/specs-table";
import { ProductGrid } from "@/components/storefront/product-grid";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { WhatsAppCtaButton } from "@/components/storefront/whatsapp-cta-button";
import { buildStoreWhatsAppLink, getSiteUrl } from "@/lib/whatsapp";

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

  const description = product.description.slice(0, 160);
  const price = Number(product.discountPrice ?? product.price);
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "NGN",
    },
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

  const productLink = `${getSiteUrl()}/product/${product.slug}`;
  const whatsappLink = buildStoreWhatsAppLink(
    `Hi, I'm interested in the ${product.name} listed on ByteHaven (${productLink}).`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: productLink,
      priceCurrency: "NGN",
      price: Number(product.discountPrice ?? product.price),
      availability: isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition:
        product.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              href="/shop"
              className="hover:text-secondary transition-colors"
            >
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/shop/${product.category.slug}`}
              className="hover:text-secondary transition-colors"
            >
              {product.category.name}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
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

          <div className="border-border mt-6 rounded-xl border p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-primary text-3xl font-bold">
                {naira.format(Number(product.discountPrice ?? product.price))}
              </span>
              {hasDiscount && (
                <span className="text-muted-foreground text-lg line-through">
                  {naira.format(Number(product.price))}
                </span>
              )}
            </div>

            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium">
              {isSoldOut ? (
                <>
                  <span className="bg-destructive h-2 w-2 rounded-full" />
                  <span className="text-destructive">Out of stock</span>
                </>
              ) : product.stockQuantity <= 3 ? (
                <>
                  <span className="bg-accent h-2 w-2 rounded-full" />
                  <span className="text-accent-foreground">
                    Only {product.stockQuantity} left in stock
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-secondary h-2 w-2 rounded-full" />
                  <span className="text-secondary">In stock</span>
                </>
              )}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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
              {whatsappLink && (
                <WhatsAppCtaButton
                  link={whatsappLink}
                  label="Chat on WhatsApp"
                />
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <span className="bg-secondary h-4 w-1 rounded-full" />
              Specifications
            </h2>
            <div className="mt-3">
              <SpecsTable specs={product.specs as Record<string, string>} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <span className="bg-secondary h-4 w-1 rounded-full" />
              Description
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-primary text-xl font-bold">Related products</h2>
          <div className="mt-5">
            <ProductGrid products={related} />
          </div>
        </div>
      )}
    </div>
  );
}
