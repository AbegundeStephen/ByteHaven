"use client";

import { useState } from "react";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  productCount: number;
}

interface CategoryManagerProps {
  initialCategories: CategoryRow[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(
      data.categories.map(
        (c: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sortOrder: number;
          _count: { products: number };
        }) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          sortOrder: c.sortOrder,
          productCount: c._count.products,
        }),
      ),
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!newName.trim()) {
      setError("Name is required.");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        description: newDescription || null,
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to create category.");
      return;
    }
    setNewName("");
    setNewDescription("");
    setMessage("Category created.");
    await refresh();
  }

  function startEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
    setError(null);
    setMessage(null);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    setMessage(null);
    if (!editName.trim()) {
      setError("Name is required.");
      return;
    }
    setBusyId(id);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        description: editDescription || null,
      }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to update category.");
      return;
    }
    setEditingId(null);
    setMessage("Category updated.");
    await refresh();
  }

  async function handleDelete(id: string) {
    setError(null);
    setMessage(null);
    setBusyId(id);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to delete category.");
      return;
    }
    setMessage("Category deleted.");
    await refresh();
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setError(null);
    setMessage(null);
    setBusyId(id);
    const res = await fetch(`/api/admin/categories/${id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError("Failed to reorder category.");
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-foreground block text-sm font-medium">
            New category name
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
            placeholder="e.g. Gaming Laptops"
          />
        </div>
        <div className="flex-1">
          <label className="text-foreground block text-sm font-medium">
            Description (optional)
          </label>
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="border-input bg-background focus:ring-ring mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-primary text-primary-foreground h-10 shrink-0 rounded-md px-4 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add category"}
        </button>
      </form>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
      {message && !error && (
        <p className="text-secondary text-sm font-medium">{message}</p>
      )}

      <div className="border-border bg-card overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="border-border text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className="border-border border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMove(cat.id, "up")}
                      disabled={i === 0 || busyId === cat.id}
                      className="border-input rounded border px-2 py-1 text-xs disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(cat.id, "down")}
                      disabled={
                        i === categories.length - 1 || busyId === cat.id
                      }
                      className="border-input rounded border px-2 py-1 text-xs disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="space-y-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
                      />
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-foreground font-medium">
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div className="text-muted-foreground text-xs">
                          {cat.description}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="text-muted-foreground px-4 py-3">{cat.slug}</td>
                <td className="px-4 py-3">{cat.productCount}</td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={busyId === cat.id}
                        className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="border-input rounded-md border px-3 py-1.5 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={busyId === cat.id || cat.productCount > 0}
                        title={
                          cat.productCount > 0
                            ? "Reassign or remove products before deleting"
                            : undefined
                        }
                        className="border-destructive text-destructive hover:bg-destructive/10 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-4 py-6 text-center"
                >
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
