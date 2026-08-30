import { NextRequest, NextResponse } from "next/server";
import {
  createCategory,
  listCategoriesWithProductCount,
} from "@/lib/categories";
import { categoryInputSchema } from "@/lib/validation/category";

export async function GET() {
  const categories = await listCategoriesWithProductCount();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json({ category }, { status: 201 });
}
