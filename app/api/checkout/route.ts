import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { checkoutInputSchema } from "@/lib/validation/checkout";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { items, ...customerInput } = parsed.data;

  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || product.deletedAt) {
      return NextResponse.json(
        { error: "One of the items in your cart is no longer available." },
        { status: 409 },
      );
    }
    if (product.status !== "active") {
      return NextResponse.json(
        { error: `${product.name} is no longer available for purchase.` },
        { status: 409 },
      );
    }
    if (product.stockQuantity < item.quantity) {
      return NextResponse.json(
        {
          error: `Only ${product.stockQuantity} unit(s) of ${product.name} left in stock.`,
        },
        { status: 409 },
      );
    }
  }

  const order = await createOrder({ ...customerInput, items });

  return NextResponse.json(
    { orderNumber: order.orderNumber, orderId: order.id },
    { status: 201 },
  );
}
