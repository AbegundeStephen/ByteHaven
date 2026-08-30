import { Resend } from "resend";
import type { Order, OrderItem } from "@/lib/generated/prisma/client";

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM_ADDRESS ?? "onboarding@resend.dev";
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

type OrderWithItems = Order & { items: OrderItem[] };

function itemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${item.productNameSnapshot} &times; ${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">${naira.format(Number(item.lineTotal))}</td>
    </tr>`,
    )
    .join("");
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;">
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px 16px;color:#0f172a;">
      <p style="font-size:20px;font-weight:bold;color:#0b2447;margin:0 0 16px;">
        Byte<span style="color:#0f766e;">Haven</span>
      </p>
      <h1 style="font-size:18px;margin:0 0 12px;">${title}</h1>
      ${bodyHtml}
    </div>
  </body>
</html>`;
}

/** Sent to the buyer once an order's payment is confirmed (FR-D2/FR-I1). */
export async function sendOrderConfirmationEmail(
  order: OrderWithItems,
): Promise<void> {
  const html = emailShell(
    `Order ${order.orderNumber} confirmed`,
    `
    <p>Hi ${order.customerName}, thanks for your order! We've received your payment.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml(order.items)}</table>
    <p style="font-weight:bold;">Total: ${naira.format(Number(order.total))}</p>
    <p style="color:#475569;font-size:14px;">
      ${
        order.deliveryMethod === "delivery"
          ? `Delivering to: ${order.deliveryAddress}`
          : "You chose pickup in person."
      }
    </p>
    <p style="color:#475569;font-size:13px;margin-top:24px;">
      You can track this order anytime on ByteHaven with your order number and the email or phone you used at checkout.
    </p>`,
  );

  const result = await getClient().emails.send({
    from: fromAddress(),
    to: order.customerEmail,
    subject: `Your ByteHaven order ${order.orderNumber} is confirmed`,
    html,
  });
  // The Resend SDK resolves with {data, error} instead of rejecting on API
  // errors — throw explicitly so callers (Promise.allSettled) see it.
  if (result.error) throw new Error(result.error.message);
}

/** Sent to the store admin whenever an order's payment is confirmed
 * (FR-D2/FR-I1). Silently no-ops if ADMIN_EMAIL isn't set. */
export async function sendAdminOrderAlertEmail(
  order: OrderWithItems,
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = emailShell(
    `New paid order: ${order.orderNumber}`,
    `
    <p>${order.customerName} just paid for order ${order.orderNumber}.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml(order.items)}</table>
    <p style="font-weight:bold;">Total: ${naira.format(Number(order.total))}</p>
    <p style="color:#475569;font-size:14px;">
      Contact: ${order.customerEmail} &middot; ${order.customerPhone}<br/>
      ${
        order.deliveryMethod === "delivery"
          ? `Delivery to: ${order.deliveryAddress}`
          : "Pickup in person"
      }
    </p>`,
  );

  const result = await getClient().emails.send({
    from: fromAddress(),
    to: adminEmail,
    subject: `New paid order: ${order.orderNumber}`,
    html,
  });
  if (result.error) throw new Error(result.error.message);
}
