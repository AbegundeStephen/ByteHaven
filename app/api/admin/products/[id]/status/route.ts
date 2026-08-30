import { NextRequest, NextResponse } from "next/server";
import { setProductStatus } from "@/lib/products";
import { productStatusSchema } from "@/lib/validation/product";
import { z } from "zod";

const bodySchema = z.object({ status: productStatusSchema });

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
    const product = await setProductStatus(id, parsed.data.status);
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}
