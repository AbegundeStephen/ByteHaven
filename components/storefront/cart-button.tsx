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
      className="text-primary hover:bg-muted relative inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors"
      aria-label={`View cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.784 2.482-7.34a.75.75 0 0 0-.75-.883H5.106M7.5 14.25 5.106 5.114M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span
          key={count}
          className="bg-accent text-accent-foreground animate-in zoom-in absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold duration-200 sm:static sm:ml-0.5"
        >
          {count}
        </span>
      )}
    </button>
  );
}
