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
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="border-border border-t-secondary h-8 w-8 animate-spin rounded-full border-2" />
        <p className="text-muted-foreground mt-4 text-sm">Loading order…</p>
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
      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
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
          className="bg-primary text-primary-foreground mt-6 h-12 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
        >
          {paying ? "Opening payment…" : "Pay Now"}
        </button>

        <p className="text-muted-foreground mt-4 flex items-center justify-center gap-1.5 text-xs">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
              clipRule="evenodd"
            />
          </svg>
          Secured by Paystack
        </p>
      </div>
    </div>
  );
}
