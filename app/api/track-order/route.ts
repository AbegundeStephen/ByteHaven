import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumberAndContact } from "@/lib/orders";
import { trackOrderInputSchema } from "@/lib/validation/track-order";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = trackOrderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter your order number and the email or phone used on it." },
      { status: 400 },
    );
  }

  const { orderNumber, email, phone } = parsed.data;
  const order = await getOrderByNumberAndContact(orderNumber, {
    email: email || undefined,
    phone: phone || undefined,
  });

  // Deliberately generic — never reveal whether an order number exists at
  // all, only whether this exact number+contact pair matches (FR-D3).
  if (!order) {
    return NextResponse.json(
      {
        error:
          "No matching order found. Check your order number and contact details.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryMethod: order.deliveryMethod,
    deliveryAddress: order.deliveryAddress,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  });
}
