import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Minimal public lookup by order number alone — used by the payment page
 * that immediately follows checkout in the same session. Deliberately
 * excludes contact/address details; see /api/track-order for the
 * contact-verified lookup buyers use later (FR-D3). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    items: order.items.map((item) => ({
      productNameSnapshot: item.productNameSnapshot,
      unitPriceSnapshot: item.unitPriceSnapshot,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  });
}
