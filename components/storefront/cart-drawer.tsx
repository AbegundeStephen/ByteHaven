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

  if (!hydrated || !isOpen) return null;

  const subtotal = cartSubtotal(items);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className="bg-foreground/30 absolute inset-0"
      />
      <div className="bg-background relative flex h-full w-full max-w-sm flex-col shadow-xl">
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 className="text-foreground text-lg font-semibold">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="hover:bg-muted rounded-md p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Your cart is empty.
            </p>
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
                className="bg-primary text-primary-foreground flex h-11 items-center justify-center rounded-md text-sm font-semibold hover:opacity-90"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="border-input hover:bg-muted flex h-11 items-center justify-center rounded-md border text-sm font-medium"
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
