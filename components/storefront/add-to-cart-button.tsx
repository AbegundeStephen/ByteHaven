"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  unitPrice: number;
  stockQuantity: number;
  isSoldOut: boolean;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  brand,
  imageUrl,
  unitPrice,
  stockQuantity,
  isSoldOut,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  if (isSoldOut) {
    return (
      <button
        type="button"
        disabled
        className="bg-muted text-muted-foreground h-12 flex-1 cursor-not-allowed rounded-md px-6 text-sm font-semibold"
      >
        Unavailable
      </button>
    );
  }

  const maxSelectable = Math.min(stockQuantity, 10);

  return (
    <div className="flex gap-3">
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        aria-label="Quantity"
        className="border-input bg-background rounded-md border px-3 py-2 text-sm"
      >
        {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() =>
          addItem(
            {
              productId,
              slug,
              name,
              brand,
              imageUrl,
              unitPrice,
              maxQuantity: stockQuantity,
            },
            quantity,
          )
        }
        className="bg-primary text-primary-foreground h-11 flex-1 rounded-md px-6 text-sm font-semibold transition-colors hover:opacity-90"
      >
        Add to Cart
      </button>
    </div>
  );
}
