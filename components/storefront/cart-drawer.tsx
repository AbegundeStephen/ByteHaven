"use client";

import Link from "next/link";
import { cartSubtotal, useCartStore } from "@/lib/cart-store";
import { CartLineItem } from "@/components/storefront/cart-line-item";
import { useHydrated } from "@/lib/use-hydrated";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function CartDrawer() {
  const hydrated = useHydrated();
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const items = useCartStore((s) => s.items);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (!hydrated) return null;

  const subtotal = cartSubtotal(items);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
        onClick={closeDrawer}
        className="bg-foreground/40 absolute inset-0 backdrop-blur-[1px]"
      />
      <div
        className={`bg-background relative flex h-full w-full max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 className="text-foreground text-lg font-semibold">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="text-muted-foreground h-12 w-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.784 2.482-7.34a.75.75 0 0 0-.75-.883H5.106M7.5 14.25 5.106 5.114M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <p className="text-muted-foreground mt-3 text-sm">
                Your cart is empty.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                compact
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-border border-t p-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span className="text-primary text-lg font-bold">
                {naira.format(subtotal)}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="bg-primary text-primary-foreground flex h-11 items-center justify-center rounded-lg text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="border-input hover:bg-muted flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
