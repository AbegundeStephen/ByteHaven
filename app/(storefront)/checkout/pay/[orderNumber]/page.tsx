"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface OrderSummary {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  items: {
    productNameSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    lineTotal: string;
  }[];
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function PayPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setOrder(data);
        if (data.paymentStatus === "success") {
          router.replace(`/order-confirmation/${orderNumber}`);
        }
      })
      .finally(() => setLoading(false));
  }, [orderNumber, router]);

  async function handlePayNow() {
    setError(null);
    setPaying(true);

    const res = await fetch(`/api/checkout/${orderNumber}/initialize`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not start payment. Please try again.");
      setPaying(false);
      return;
    }

    // Dynamically imported so this browser-only module (it touches `window`
    // at load time) is never evaluated during Next.js's SSR pass, even
    // though this is a "use client" page.
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction(data.accessCode, {
      onSuccess: () => {
        router.push(`/order-confirmation/${orderNumber}`);
      },
      onCancel: () => {
        setPaying(false);
      },
      onError: (err) => {
        setError(err.message);
        setPaying(false);
      },
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-sm">Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-foreground font-medium">
          {error ?? "Order not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-border bg-card rounded-xl border p-8">
        <p className="text-secondary text-sm font-semibold tracking-wide uppercase">
          Order {order.orderNumber}
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-bold">
          Complete your payment
        </h1>

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

        {error && (
          <p className="text-destructive mt-4 text-sm font-medium">{error}</p>
        )}

        <button
          type="button"
          onClick={handlePayNow}
          disabled={paying}
          className="bg-primary text-primary-foreground mt-6 h-12 w-full rounded-md text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {paying ? "Opening payment…" : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
