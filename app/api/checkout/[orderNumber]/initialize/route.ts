import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "success") {
    return NextResponse.json(
      { error: "This order has already been paid for." },
      { status: 409 },
    );
  }
  if (order.status === "cancelled") {
    return NextResponse.json(
      { error: "This order has been cancelled." },
      { status: 409 },
    );
  }

  // A fresh reference per attempt — Paystack rejects re-initializing with a
  // reference that's already been used, and this lets the buyer retry the
  // same order after an abandoned/failed attempt (FR-C4).
  const reference = `${order.orderNumber}-${Date.now()}`;
  const origin = req.nextUrl.origin;

  try {
    const result = await initializeTransaction({
      email: order.customerEmail,
      amountKobo: Math.round(Number(order.total) * 100),
      reference,
      callbackUrl: `${origin}/order-confirmation/${order.orderNumber}`,
      metadata: { orderNumber: order.orderNumber },
    });

    await db.order.update({
      where: { id: order.id },
      data: { paymentReference: reference },
    });

    return NextResponse.json({
      accessCode: result.accessCode,
      authorizationUrl: result.authorizationUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to start payment";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
