import { NextRequest, NextResponse } from "next/server";
import { createProduct, listProducts, ProductSortOption } from "@/lib/products";
import { productInputSchema } from "@/lib/validation/product";
import type {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/client";

const SORT_OPTIONS: ProductSortOption[] = [
  "price_asc",
  "price_desc",
  "newest",
  "popularity",
  "stock_asc",
  "stock_desc",
  "name_asc",
];

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const search = params.get("q") ?? undefined;
  const categoryId = params.get("categoryId") ?? undefined;
  const statusParam = params.get("status");
  const statuses = statusParam
    ? (statusParam.split(",") as ProductStatus[])
    : undefined;
  const conditionParam = params.get("condition");
  const condition = conditionParam
    ? (conditionParam.split(",") as ProductCondition[])
    : undefined;
  const sortParam = params.get("sort");
  const sort = SORT_OPTIONS.includes(sortParam as ProductSortOption)
    ? (sortParam as ProductSortOption)
    : "newest";
  const page = Number(params.get("page") ?? "1") || 1;
  const includeDeleted = params.get("includeDeleted") === "true";

  const result = await listProducts({
    filters: { search, categoryId, statuses, condition, includeDeleted },
    sort,
    page,
    pageSize: 20,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const product = await createProduct(parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}
