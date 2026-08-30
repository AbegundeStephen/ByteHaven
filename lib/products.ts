import { db } from "@/lib/db";
import {
  Prisma,
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/client";

export type ProductSortOption =
  "price_asc" | "price_desc" | "newest" | "popularity";

export interface ProductFilters {
  categorySlug?: string;
  brand?: string[];
  condition?: ProductCondition[];
  statuses?: ProductStatus[];
  minPrice?: number;
  maxPrice?: number;
  /** Best-effort substring match against specs.ram, e.g. "16GB". */
  ram?: string;
  /** Best-effort substring match against specs.storage, e.g. "512GB". */
  storage?: string;
  /** Best-effort substring match against specs.screen_size. */
  screenSize?: string;
  /** Matches against name, brand, and description. */
  search?: string;
}

export interface ListProductsOptions {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  page?: number;
  pageSize?: number;
}

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

function buildWhere(filters: ProductFilters = {}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.brand?.length) {
    where.brand = { in: filters.brand };
  }
  if (filters.condition?.length) {
    where.condition = { in: filters.condition };
  }
  if (filters.statuses?.length) {
    where.status = { in: filters.statuses };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.ram) {
    where.specs = { path: ["ram"], string_contains: filters.ram };
  }
  if (filters.storage) {
    where.specs = { path: ["storage"], string_contains: filters.storage };
  }
  if (filters.screenSize) {
    where.specs = {
      path: ["screen_size"],
      string_contains: filters.screenSize,
    };
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(
  sort: ProductSortOption = "newest",
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "popularity":
      return { orderItems: { _count: "desc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function listProducts(options: ListProductsOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 24));
  const where = buildWhere(options.filters);
  const orderBy = buildOrderBy(options.sort);

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      include: productInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}
