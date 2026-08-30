import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById, getValidNextStatuses } from "@/lib/orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { OrderStatusControl } from "@/components/admin/order-status-control";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);
  return { title: order ? `Order ${order.orderNumber}` : "Order" };
}

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const whatsappMessage = `Hi ${order.customerName}, this is ByteHaven regarding your order ${order.orderNumber}.`;
  const whatsappLink = buildWhatsAppLink(order.customerPhone, whatsappMessage);

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-primary text-2xl font-bold">
          Order {order.orderNumber}
        </h1>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-secondary text-secondary-foreground inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium hover:opacity-90"
        >
          Chat with buyer on WhatsApp
        </a>
      </div>

      <div className="border-border bg-card mt-6 rounded-xl border p-5">
        <h2 className="text-foreground text-sm font-semibold">Update status</h2>
        <div className="mt-3">
          <OrderStatusControl
            orderId={order.id}
            currentStatus={order.status}
            validNextStatuses={getValidNextStatuses(order.status)}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-foreground text-sm font-semibold">Customer</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="text-foreground">{order.customerPhone}</dd>
            </div>
          </dl>
        </div>

        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-foreground text-sm font-semibold">Delivery</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Method</dt>
              <dd className="text-foreground capitalize">
                {order.deliveryMethod}
              </dd>
            </div>
            {order.deliveryAddress && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Address</dt>
                <dd className="text-foreground text-right">
                  {order.deliveryAddress}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-foreground text-sm font-semibold">Payment</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="text-foreground capitalize">
                {order.paymentStatus}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground shrink-0">Reference</dt>
              <dd className="text-foreground truncate text-right">
                {order.paymentReference ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-border bg-card rounded-xl border p-5">
          <h2 className="text-foreground text-sm font-semibold">Order Info</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Placed</dt>
              <dd className="text-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="text-foreground">
                {new Date(order.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-border bg-card mt-6 rounded-xl border p-5">
        <h2 className="text-foreground text-sm font-semibold">Items</h2>
        <div className="mt-3 space-y-2">
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
        <div className="border-border mt-3 flex justify-between border-t pt-3 text-sm font-semibold">
          <span>Total</span>
          <span className="text-primary">
            {naira.format(Number(order.total))}
          </span>
        </div>
      </div>
    </div>
  );
}
