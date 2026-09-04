import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { confirmOrderPayment } from "@/lib/paystack";
import { WhatsAppCtaButton } from "@/components/storefront/whatsapp-cta-button";
import { buildStoreWhatsAppLink } from "@/lib/whatsapp";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderNumber } = await params;

  let order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  // Fallback verify in case the webhook hasn't landed yet (FR-C3).
  if (order.paymentStatus !== "success" && order.paymentReference) {
    await confirmOrderPayment(order.paymentReference).catch(() => {});
    order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) notFound();
  }

  if (order.paymentStatus !== "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="border-border bg-card rounded-xl border p-8">
          <p className="text-destructive text-sm font-semibold tracking-wide uppercase">
            Payment not completed
          </p>
          <h1 className="text-foreground mt-2 text-xl font-bold">
            Order {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            We haven&apos;t received a successful payment for this order yet. If
            you closed the payment window, you can try again below — this
            won&apos;t create a duplicate order.
          </p>
          <Link
            href={`/checkout/pay/${order.orderNumber}`}
            className="bg-primary text-primary-foreground mt-6 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            Retry Payment
          </Link>
        </div>
      </div>
    );
  }

  const whatsappLink = buildStoreWhatsAppLink(
    `Hi, I just placed order ${order.orderNumber} on ByteHaven and wanted to confirm delivery details.`,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
        <div className="bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="text-secondary h-7 w-7"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.006l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.797 2.796 6.79-6.89a1 1 0 0 1 1.413-.012Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-secondary mt-4 text-sm font-semibold tracking-wide uppercase">
          Payment successful
        </p>
        <h1 className="text-foreground mt-1 text-2xl font-bold">
          Order {order.orderNumber}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Thank you, {order.customerName}! We&apos;ve received your payment.
        </p>

        <div className="mt-6 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span className="text-foreground font-medium">
                {naira.format(Number(item.lineTotal))}
              </span>
            </div>
          ))}
        </div>
        <div className="border-border mt-3 flex justify-between border-t pt-3 text-base font-semibold">
          <span>Total paid</span>
          <span className="text-primary">
            {naira.format(Number(order.total))}
          </span>
        </div>

        <div className="bg-muted text-muted-foreground mt-6 rounded-lg p-4 text-sm">
          <p className="text-foreground font-medium">Delivery details</p>
          <p className="mt-1">
            {order.deliveryMethod === "delivery"
              ? order.deliveryAddress
              : "Pickup in person"}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {whatsappLink && (
            <WhatsAppCtaButton
              link={whatsappLink}
              label="Confirm on WhatsApp"
            />
          )}

          <Link
            href="/shop"
            className="border-input hover:bg-muted inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
