import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";
import type { OrderStatus } from "@/lib/generated/prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const statusParam = params.get("status");
  const status = VALID_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const dateFromParam = params.get("dateFrom");
  const dateToParam = params.get("dateTo");
  const page = Number(params.get("page") ?? "1") || 1;

  const result = await listOrders({
    filters: {
      status,
      dateFrom: dateFromParam ? new Date(dateFromParam) : undefined,
      dateTo: dateToParam ? new Date(dateToParam) : undefined,
    },
    page,
    pageSize: 20,
  });

  return NextResponse.json(result);
}
