"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cartSubtotal, useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const inputClass =
  "border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-shadow focus:ring-2";

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = hydrated ? cartSubtotal(items) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim()
    ) {
      setError("Name, email, and phone are required.");
      return;
    }
    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      setError("Delivery address is required for delivery orders.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === "delivery" ? deliveryAddress : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    const data = await res.json();
    clearCart();
    router.push(`/checkout/pay/${data.orderNumber}`);
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-foreground font-medium">Your cart is empty.</p>
        <Link
          href="/shop"
          className="bg-secondary text-secondary-foreground mt-4 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-primary text-2xl font-bold">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="border-border bg-card space-y-5 rounded-xl border p-6 shadow-sm lg:col-span-2"
          noValidate
        >
          <div>
            <label
              htmlFor="checkout-name"
              className="text-foreground block text-sm font-medium"
            >
              Full name
            </label>
            <input
              id="checkout-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="checkout-email"
              className="text-foreground block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="checkout-phone"
              className="text-foreground block text-sm font-medium"
            >
              Phone number
            </label>
            <input
              id="checkout-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="08012345678"
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className="text-foreground text-sm font-medium">
              Delivery method
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(
                [
                  { value: "delivery", label: "Delivery" },
                  { value: "pickup", label: "Pickup in person" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    deliveryMethod === option.value
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={option.value}
                    checked={deliveryMethod === option.value}
                    onChange={() => setDeliveryMethod(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {deliveryMethod === "delivery" && (
            <div>
              <label
                htmlFor="checkout-address"
                className="text-foreground block text-sm font-medium"
              >
                Delivery address
              </label>
              <textarea
                id="checkout-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground h-11 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {submitting ? "Placing order…" : "Place Order"}
          </button>
        </form>

        <div className="border-border bg-card h-fit rounded-xl border p-5 shadow-sm">
          <h2 className="text-foreground text-sm font-semibold">
            Order Summary
          </h2>
          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-foreground font-medium">
                  {naira.format(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-border mt-3 flex justify-between border-t pt-3 text-sm font-semibold">
            <span>Total</span>
            <span className="text-primary">{naira.format(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
