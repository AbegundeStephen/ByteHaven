import { db } from "@/lib/db";
import {
  DeliveryMethod,
  OrderStatus,
  Prisma,
} from "@/lib/generated/prisma/client";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  items: CreateOrderItemInput[];
}

async function generateUniqueOrderNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `BH-${10000 + Math.floor(Math.random() * 90000)}`;
    const existing = await tx.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("Failed to generate a unique order number after 5 attempts");
}

/** Creates an Order with its OrderItems in a single transaction, snapshotting
 * each product's current name/price so later catalog changes never alter
 * historical orders. */
export async function createOrder(input: CreateOrderInput) {
  if (input.items.length === 0) {
    throw new Error("Cannot create an order with no items");
  }

  return db.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    let subtotal = new Prisma.Decimal(0);
    const itemsData = input.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const unitPrice = product.discountPrice ?? product.price;
      const lineTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      return {
        productId: product.id,
        productNameSnapshot: product.name,
        unitPriceSnapshot: unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const orderNumber = await generateUniqueOrderNumber(tx);

    return tx.order.create({
      data: {
        orderNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        deliveryMethod: input.deliveryMethod,
        deliveryAddress: input.deliveryAddress,
        subtotal,
        total: subtotal,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  });
}

export interface OrderContact {
  email?: string;
  phone?: string;
}

/** Looks up an order by order number, only returning it if the supplied email
 * or phone matches the order on file — so a buyer can never view someone
 * else's order (FR-D3). */
export async function getOrderByNumberAndContact(
  orderNumber: string,
  contact: OrderContact,
) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) return null;

  const emailMatches =
    !!contact.email &&
    order.customerEmail.toLowerCase() === contact.email.toLowerCase();
  const phoneMatches = !!contact.phone && order.customerPhone === contact.phone;

  if (!emailMatches && !phoneMatches) return null;
  return order;
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListOrdersOptions {
  filters?: OrderFilters;
  page?: number;
  pageSize?: number;
}

export async function listOrders(options: ListOrdersOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const filters = options.filters ?? {};

  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  const [items, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

/** Valid forward transitions per status (SRS 4.7/FR-G3) — no skipping ahead
 * (e.g. pending can't jump straight to delivered), and delivered/cancelled
 * are terminal. Cancellation is allowed from any non-terminal state. */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function getValidNextStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[current];
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot move an order from "${from}" to "${to}".`);
  }
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus) {
  const order = await db.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order not found");

  if (!ORDER_STATUS_TRANSITIONS[order.status].includes(newStatus)) {
    throw new InvalidOrderStatusTransitionError(order.status, newStatus);
  }

  return db.order.update({ where: { id }, data: { status: newStatus } });
}
