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
        className={`bg-muted relative shrink-0 overflow-hidden rounded-md ${compact ? "h-16 w-16" : "h-20 w-20"}`}
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
              className="border-input bg-background rounded-md border px-2 py-1 text-sm"
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
              className="text-destructive text-xs font-medium hover:underline"
            >
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
