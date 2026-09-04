import Link from "next/link";
import Image from "next/image";
import type { ProductWithRelations } from "@/lib/products";
import { ConditionBadge } from "@/components/storefront/condition-badge";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];
  const isSoldOut =
    product.status === "sold_out" || product.stockQuantity === 0;
  const hasDiscount = product.discountPrice !== null;
  const discountPercent = hasDiscount
    ? Math.round(
        (1 - Number(product.discountPrice) / Number(product.price)) * 100,
      )
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
          <ConditionBadge condition={product.condition} className="shadow-sm" />
          {hasDiscount && !isSoldOut && (
            <span className="bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
        {isSoldOut && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-semibold">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-muted-foreground text-xs">{product.brand}</p>
        <h3 className="text-foreground group-hover:text-secondary line-clamp-2 text-sm font-medium transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-primary text-base font-semibold">
            {naira.format(Number(product.discountPrice ?? product.price))}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-xs line-through">
              {naira.format(Number(product.price))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
