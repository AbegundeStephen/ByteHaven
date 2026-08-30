import { NextRequest, NextResponse } from "next/server";
import { moveCategory } from "@/lib/categories";
import { categoryReorderSchema } from "@/lib/validation/category";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = categoryReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await moveCategory(id, parsed.data.direction);
  return NextResponse.json({ success: true });
}
