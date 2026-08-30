import { db } from "@/lib/db";
import {
  Prisma,
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/client";
import { deleteProductImage } from "@/lib/storage";

export const LOW_STOCK_THRESHOLD = 3;

export type ProductSortOption =
  | "price_asc"
  | "price_desc"
  | "newest"
  | "popularity"
  | "stock_asc"
  | "stock_desc"
  | "name_asc";

export interface ProductFilters {
  categorySlug?: string;
  categoryId?: string;
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
  /** Admin use only — include soft-deleted (archived) products. */
  includeDeleted?: boolean;
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

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function buildWhere(filters: ProductFilters = {}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (!filters.includeDeleted) {
    where.deletedAt = null;
  }
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
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
    case "stock_asc":
      return { stockQuantity: "asc" };
    case "stock_desc":
      return { stockQuantity: "desc" };
    case "name_asc":
      return { name: "asc" };
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

export function getRelatedProducts(product: ProductWithRelations, take = 4) {
  return db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      deletedAt: null,
      status: { in: ["active", "sold_out"] },
    },
    orderBy: { createdAt: "desc" },
    take,
    include: productInclude,
  });
}

export async function listBrands() {
  const rows = await db.product.findMany({
    where: { deletedAt: null, status: { in: ["active", "sold_out"] } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

export type ShopSearchParams = Record<string, string | string[] | undefined>;

const VALID_SORTS: ProductSortOption[] = [
  "price_asc",
  "price_desc",
  "newest",
  "popularity",
];

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Parses shop-page URL search params (from ?q=, ?brand=, ?sort=, etc.) into
 * the filters/sort/page shape listProducts expects. Storefront listings only
 * ever show active + sold_out (never draft or archived). */
export function parseShopSearchParams(
  params: ShopSearchParams,
  lockedCategorySlug?: string,
): { filters: ProductFilters; sort: ProductSortOption; page: number } {
  const brand = firstValue(params.brand)?.split(",").filter(Boolean);
  const condition = firstValue(params.condition)?.split(",").filter(Boolean) as
    ProductCondition[] | undefined;
  const minPrice = firstValue(params.minPrice);
  const maxPrice = firstValue(params.maxPrice);
  const sortParam = firstValue(params.sort);
  const sort = VALID_SORTS.includes(sortParam as ProductSortOption)
    ? (sortParam as ProductSortOption)
    : "newest";
  const page = Number(firstValue(params.page) ?? "1") || 1;

  return {
    filters: {
      categorySlug: lockedCategorySlug ?? firstValue(params.category),
      brand: brand?.length ? brand : undefined,
      condition: condition?.length ? condition : undefined,
      statuses: ["active", "sold_out"],
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      ram: firstValue(params.ram),
      storage: firstValue(params.storage),
      screenSize: firstValue(params.screenSize),
      search: firstValue(params.q),
    },
    sort,
    page,
  };
}

export function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Appends -2, -3, ... to a slug until it's unique, excluding excludeId
 * (the product being updated, so it doesn't collide with itself). */
export async function generateUniqueProductSlug(
  name: string,
  excludeId?: string,
) {
  const base = slugify(name);
  let candidate = base;
  let attempt = 1;
  for (;;) {
    const existing = await db.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    attempt++;
    candidate = `${base}-${attempt}`;
  }
}

export interface ProductImageInput {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductInput {
  name: string;
  brand: string;
  categoryId: string;
  condition: ProductCondition;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  specs: Record<string, string>;
  description: string;
  status: ProductStatus;
  images: ProductImageInput[];
}

function normalizeImages(images: ProductImageInput[]) {
  if (images.length === 0) return [];
  const hasPrimary = images.some((img) => img.isPrimary);
  return images.map((img, i) => ({
    url: img.url,
    isPrimary: hasPrimary ? img.isPrimary : i === 0,
    sortOrder: i,
  }));
}

export async function createProduct(input: ProductInput) {
  const slug = await generateUniqueProductSlug(input.name);
  const images = normalizeImages(input.images);

  return db.product.create({
    data: {
      name: input.name,
      slug,
      brand: input.brand,
      categoryId: input.categoryId,
      condition: input.condition,
      price: input.price,
      discountPrice: input.discountPrice,
      stockQuantity: input.stockQuantity,
      specs: input.specs,
      description: input.description,
      status: input.status,
      images: { create: images },
    },
    include: productInclude,
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  const current = await db.product.findUnique({
    where: { id },
    select: {
      name: true,
      slug: true,
      images: { select: { url: true } },
    },
  });
  if (!current) throw new Error("Product not found");

  const slug =
    current.name === input.name
      ? current.slug
      : await generateUniqueProductSlug(input.name, id);
  const images = normalizeImages(input.images);
  const newUrls = new Set(images.map((img) => img.url));
  const removedUrls = current.images
    .map((img) => img.url)
    .filter((url) => !newUrls.has(url));

  const updated = await db.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        brand: input.brand,
        categoryId: input.categoryId,
        condition: input.condition,
        price: input.price,
        discountPrice: input.discountPrice,
        stockQuantity: input.stockQuantity,
        specs: input.specs,
        description: input.description,
        status: input.status,
        images: { create: images },
      },
      include: productInclude,
    });
  });

  await cleanupRemovedImages(removedUrls);
  return updated;
}

/** Best-effort storage cleanup — failures here shouldn't fail the product
 * mutation that already committed in the database. */
async function cleanupRemovedImages(urls: string[]) {
  if (urls.length === 0) return;
  await Promise.allSettled(urls.map((url) => deleteProductImage(url)));
}

export async function setProductStatus(id: string, status: ProductStatus) {
  return db.product.update({ where: { id }, data: { status } });
}

export type DeleteProductResult = "deleted" | "archived";

/** Hard-deletes a product with no order history, or soft-deletes (archives)
 * one that has existing orders so historical orders are never broken
 * (FR-F4). */
export async function deleteOrArchiveProduct(
  id: string,
): Promise<DeleteProductResult> {
  const orderItemCount = await db.orderItem.count({
    where: { productId: id },
  });

  if (orderItemCount > 0) {
    await db.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: "sold_out" },
    });
    return "archived";
  }

  const product = await db.product.findUnique({
    where: { id },
    select: { images: { select: { url: true } } },
  });
  await db.product.delete({ where: { id } });
  if (product) {
    await cleanupRemovedImages(product.images.map((img) => img.url));
  }
  return "deleted";
}
