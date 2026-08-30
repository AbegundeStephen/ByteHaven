import Link from "next/link";

interface PendingPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function CheckoutPendingPage({
  params,
}: PendingPageProps) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="border-border bg-card rounded-xl border p-8">
        <p className="text-secondary text-sm font-semibold tracking-wide uppercase">
          Order received
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-bold">
          Order {orderNumber}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Your order has been created and is pending payment. Payment
          integration (Paystack) is wired up in the next build phase — for now,
          this confirms the cart-to-checkout flow works end-to-end.
        </p>
        <Link
          href="/shop"
          className="bg-primary text-primary-foreground mt-6 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
