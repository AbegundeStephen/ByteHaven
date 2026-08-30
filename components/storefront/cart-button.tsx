"use client";

import { cartCount, useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

export function CartButton() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const count = hydrated ? cartCount(items) : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="text-primary hover:bg-muted relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
      aria-label={`View cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      Cart
      {count > 0 && (
        <span className="bg-accent text-accent-foreground ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold">
          {count}
        </span>
      )}
    </button>
  );
}
