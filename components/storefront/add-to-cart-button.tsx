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
  const [justAdded, setJustAdded] = useState(false);

  if (isSoldOut) {
    return (
      <button
        type="button"
        disabled
        className="bg-muted text-muted-foreground h-12 flex-1 cursor-not-allowed rounded-lg px-6 text-sm font-semibold"
      >
        Unavailable
      </button>
    );
  }

  const maxSelectable = Math.min(stockQuantity, 10);

  function handleAdd() {
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
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="flex gap-3">
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        aria-label="Quantity"
        className="border-input bg-background rounded-lg border px-3 py-2 text-sm"
      >
        {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAdd}
        className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] ${
          justAdded
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
        }`}
      >
        {justAdded ? (
          <>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.006l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.797 2.796 6.79-6.89a1 1 0 0 1 1.413-.012Z"
                clipRule="evenodd"
              />
            </svg>
            Added to Cart
          </>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}
