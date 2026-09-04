"use client";

import { useState, type FormEvent } from "react";

interface OrderSummary {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  deliveryAddress: string | null;
  total: string;
  createdAt: string;
  items: { productNameSnapshot: string; quantity: number; lineTotal: string }[];
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid — awaiting processing",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  paid: "bg-secondary/10 text-secondary",
  processing: "bg-accent/20 text-accent-foreground",
  shipped: "bg-accent/20 text-accent-foreground",
  delivered: "bg-secondary/10 text-secondary",
  cancelled: "bg-destructive/10 text-destructive",
};

const inputClass =
  "border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-shadow focus:ring-2";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);

    if (!orderNumber.trim() || (!email.trim() && !phone.trim())) {
      setError("Enter your order number and the email or phone used on it.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, email, phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Order not found.");
      return;
    }
    setOrder(data);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-primary text-2xl font-bold">Track Your Order</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Enter your order number and the email or phone number you used at
        checkout.
      </p>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-card mt-6 space-y-4 rounded-xl border p-6 shadow-sm"
        noValidate
      >
        <div>
          <label
            htmlFor="track-order-number"
            className="text-foreground block text-sm font-medium"
          >
            Order number
          </label>
          <input
            id="track-order-number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="BH-12345"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="track-order-email"
            className="text-foreground block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="track-order-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="border-border h-px flex-1 border-t" />
          <span className="text-muted-foreground text-xs">or</span>
          <span className="border-border h-px flex-1 border-t" />
        </div>
        <div>
          <label
            htmlFor="track-order-phone"
            className="text-foreground block text-sm font-medium"
          >
            Phone number
          </label>
          <input
            id="track-order-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground h-11 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? "Looking up…" : "Track Order"}
        </button>
      </form>

      {order && (
        <div className="border-border bg-card animate-in fade-in mt-6 rounded-xl border p-6 shadow-sm duration-300">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <h2 className="text-foreground mt-3 text-lg font-bold">
            Order {order.orderNumber}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Placed {new Date(order.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.productNameSnapshot} × {item.quantity}
                </span>
                <span className="text-foreground font-medium">
                  {naira.format(Number(item.lineTotal))}
                </span>
              </div>
            ))}
          </div>
          <div className="border-border mt-3 flex justify-between border-t pt-3 text-sm font-semibold">
            <span>Total</span>
            <span className="text-primary">
              {naira.format(Number(order.total))}
            </span>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            {order.deliveryMethod === "delivery"
              ? `Delivering to: ${order.deliveryAddress}`
              : "Pickup in person"}
          </p>
        </div>
      )}
    </div>
  );
}
