import { db } from "@/lib/db";
import { slugify } from "@/lib/products";

export function listCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export function listCategoriesWithProductCount() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
  });
}

export function getCategoryById(id: string) {
  return db.category.findUnique({ where: { id } });
}

async function generateUniqueCategorySlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let candidate = base;
  let attempt = 1;
  for (;;) {
    const existing = await db.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    attempt++;
    candidate = `${base}-${attempt}`;
  }
}

export interface CategoryInput {
  name: string;
  description?: string | null;
}

export async function createCategory(input: CategoryInput) {
  const slug = await generateUniqueCategorySlug(input.name);
  const maxSort = await db.category.aggregate({ _max: { sortOrder: true } });
  return db.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const current = await db.category.findUnique({
    where: { id },
    select: { name: true, slug: true },
  });
  if (!current) throw new Error("Category not found");

  const slug =
    current.name === input.name
      ? current.slug
      : await generateUniqueCategorySlug(input.name, id);

  return db.category.update({
    where: { id },
    data: { name: input.name, slug, description: input.description ?? null },
  });
}

export class CategoryHasProductsError extends Error {
  constructor(public readonly productCount: number) {
    super(
      `Cannot delete category with ${productCount} product(s) assigned. Reassign or remove them first.`,
    );
  }
}

export async function deleteCategory(id: string) {
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new CategoryHasProductsError(productCount);
  }
  await db.category.delete({ where: { id } });
}

/** Swaps a category's sortOrder with its immediate neighbor in the given
 * direction. */
export async function moveCategory(id: string, direction: "up" | "down") {
  const categories = await listCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Category not found");

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= categories.length) return;

  const current = categories[index];
  const neighbor = categories[neighborIndex];

  await db.$transaction([
    db.category.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    db.category.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
}
