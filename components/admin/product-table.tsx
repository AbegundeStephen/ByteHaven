"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  discountPrice: string | null;
  stockQuantity: number;
  status: "active" | "draft" | "sold_out";
  category: { id: string; name: string };
  images: { url: string; isPrimary: boolean }[];
}

interface ListResult {
  items: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProductTableProps {
  categories: { id: string; name: string }[];
  initialResult: ListResult;
}

const LOW_STOCK_THRESHOLD = 3;

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductTable({ categories, initialResult }: ProductTableProps) {
  const [result, setResult] = useState(initialResult);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchProducts();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, status, sort, page]);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/products?${params.toString()}`);
    setLoading(false);
    if (!res.ok) {
      setError("Failed to load products.");
      return;
    }
    setResult(await res.json());
  }

  async function handleStatusToggle(id: string, newStatus: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError("Failed to update status.");
      return;
    }
    await fetchProducts();
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      setError("Failed to delete product.");
      return;
    }
    await fetchProducts();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name, brand, description…"
          aria-label="Search products"
          className="border-input bg-background focus:ring-ring min-w-[220px] flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setPage(1);
            setCategoryId(e.target.value);
          }}
          aria-label="Filter by category"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          aria-label="Filter by status"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="sold_out">Sold out</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="name_asc">Name A–Z</option>
          <option value="price_asc">Price low–high</option>
          <option value="price_desc">Price high–low</option>
          <option value="stock_asc">Stock low–high</option>
        </select>
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <div className="border-border bg-card overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="border-border text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((p) => {
              const primaryImage =
                p.images.find((img) => img.isPrimary) ?? p.images[0];
              const lowStock =
                p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK_THRESHOLD;
              return (
                <tr key={p.id} className="border-border border-b last:border-0">
                  <td className="px-4 py-3">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={p.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="bg-muted h-12 w-12 rounded-md" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{p.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {p.brand}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-3">
                    {naira.format(Number(p.discountPrice ?? p.price))}
                    {p.discountPrice && (
                      <span className="text-muted-foreground ml-1 text-xs line-through">
                        {naira.format(Number(p.price))}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span>{p.stockQuantity}</span>
                    {lowStock && (
                      <span className="bg-accent text-accent-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                        Low stock
                      </span>
                    )}
                    {p.stockQuantity === 0 && (
                      <span className="bg-destructive/10 text-destructive ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                        Out of stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      disabled={busyId === p.id}
                      onChange={(e) => handleStatusToggle(p.id, e.target.value)}
                      aria-label={`Status for ${p.name}`}
                      className="border-input bg-background rounded-md border px-2 py-1 text-xs"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="sold_out">Sold out</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={busyId === p.id}
                        className="border-destructive text-destructive hover:bg-destructive/10 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {result.items.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={7}
                  className="text-muted-foreground px-4 py-6 text-center"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            Page {result.page} of {result.totalPages} ({result.total} products)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="border-input rounded-md border px-3 py-1.5 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={page >= result.totalPages}
              className="border-input rounded-md border px-3 py-1.5 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
