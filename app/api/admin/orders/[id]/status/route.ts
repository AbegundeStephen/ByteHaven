import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  InvalidOrderStatusTransitionError,
  updateOrderStatus,
} from "@/lib/orders";

const bodySchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, parsed.data.status);
    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof InvalidOrderStatusTransitionError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
