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

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const showItems = hydrated ? items : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-primary text-2xl font-bold">Your Cart</h1>

      {hydrated && showItems.length === 0 ? (
        <div className="border-border mt-8 rounded-xl border border-dashed p-12 text-center">
          <p className="text-foreground font-medium">Your cart is empty</p>
          <Link
            href="/shop"
            className="bg-secondary text-secondary-foreground mt-4 inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-medium hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="border-border bg-card rounded-xl border px-4 lg:col-span-2">
            {showItems.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="border-border bg-card h-fit rounded-xl border p-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span className="text-primary text-lg font-bold">
                {naira.format(subtotal)}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Delivery fees, if any, are arranged directly with the seller.
            </p>
            <Link
              href="/checkout"
              className="bg-primary text-primary-foreground mt-4 flex h-11 items-center justify-center rounded-md text-sm font-semibold hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
