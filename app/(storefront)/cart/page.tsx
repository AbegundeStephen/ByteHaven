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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="text-muted-foreground mx-auto h-14 w-14"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.784 2.482-7.34a.75.75 0 0 0-.75-.883H5.106M7.5 14.25 5.106 5.114M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <p className="text-foreground mt-4 font-medium">Your cart is empty</p>
          <Link
            href="/shop"
            className="bg-secondary text-secondary-foreground mt-4 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="border-border bg-card rounded-xl border px-4 shadow-sm lg:col-span-2">
            {showItems.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="border-border bg-card h-fit rounded-xl border p-5 shadow-sm">
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
              className="bg-primary text-primary-foreground mt-4 flex h-11 items-center justify-center rounded-lg text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
