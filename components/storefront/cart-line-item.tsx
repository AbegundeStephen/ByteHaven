import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/lib/cart-store";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  compact?: boolean;
}

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  compact,
}: CartLineItemProps) {
  return (
    <div className="border-border flex gap-3 border-b py-4 last:border-0">
      <Link
        href={`/product/${item.slug}`}
        className={`bg-muted border-border relative shrink-0 overflow-hidden rounded-lg border ${compact ? "h-16 w-16" : "h-20 w-20"}`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col">
        <Link
          href={`/product/${item.slug}`}
          className="text-foreground line-clamp-2 text-sm font-medium hover:underline"
        >
          {item.name}
        </Link>
        <p className="text-muted-foreground text-xs">{item.brand}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <select
              value={item.quantity}
              onChange={(e) =>
                onUpdateQuantity(item.productId, Number(e.target.value))
              }
              aria-label={`Quantity for ${item.name}`}
              className="border-input bg-background rounded-lg border px-2 py-1 text-sm"
            >
              {Array.from(
                {
                  length: Math.max(
                    item.quantity,
                    Math.min(item.maxQuantity, 10),
                  ),
                },
                (_, i) => i + 1,
              ).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              className="text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482 41.03 41.03 0 0 0-2.365-.298V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4Z"
                  clipRule="evenodd"
                />
              </svg>
              Remove
            </button>
          </div>
          <span className="text-foreground text-sm font-semibold">
            {naira.format(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
