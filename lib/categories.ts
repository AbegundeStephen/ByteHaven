import { db } from "@/lib/db";

export function listCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
  });
}
