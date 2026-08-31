"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ImageUploader,
  type ImageEntry,
} from "@/components/admin/image-uploader";

export interface ProductFormValues {
  name: string;
  brand: string;
  categoryId: string;
  condition: "new" | "uk_used" | "refurbished";
  price: string;
  discountPrice: string;
  stockQuantity: string;
  processor: string;
  ram: string;
  storage: string;
  screenSize: string;
  gpu: string;
  os: string;
  battery: string;
  description: string;
  status: "active" | "draft" | "sold_out";
  images: ImageEntry[];
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  brand: "",
  categoryId: "",
  condition: "new",
  price: "",
  discountPrice: "",
  stockQuantity: "0",
  processor: "",
  ram: "",
  storage: "",
  screenSize: "",
  gpu: "",
  os: "",
  battery: "",
  description: "",
  status: "draft",
  images: [],
};

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialValues?: ProductFormValues;
  productId?: string;
}

export function ProductForm({
  categories,
  initialValues,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? EMPTY_VALUES,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name || !values.brand || !values.categoryId) {
      setError("Name, brand, and category are required.");
      return;
    }
    if (!values.price || Number(values.price) <= 0) {
      setError("Price is required and must be greater than 0.");
      return;
    }
    if (
      values.discountPrice &&
      Number(values.discountPrice) >= Number(values.price)
    ) {
      setError("Discount price must be less than the regular price.");
      return;
    }
    if (
      !values.processor ||
      !values.ram ||
      !values.storage ||
      !values.screenSize ||
      !values.gpu ||
      !values.os
    ) {
      setError("All spec fields except battery are required.");
      return;
    }

    const payload = {
      name: values.name,
      brand: values.brand,
      categoryId: values.categoryId,
      condition: values.condition,
      price: Number(values.price),
      discountPrice:
        values.discountPrice && Number(values.discountPrice) > 0
          ? Number(values.discountPrice)
          : null,
      stockQuantity: Number(values.stockQuantity),
      specs: {
        processor: values.processor,
        ram: values.ram,
        storage: values.storage,
        screen_size: values.screenSize,
        gpu: values.gpu,
        os: values.os,
        battery: values.battery,
      },
      description: values.description,
      status: values.status,
      images: values.images.map((img, i) => ({
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: i,
      })),
    };

    setSaving(true);
    const res = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to save product.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Brand">
          <input
            value={values.brand}
            onChange={(e) => set("brand", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Category">
          <select
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Condition">
          <select
            value={values.condition}
            onChange={(e) =>
              set("condition", e.target.value as ProductFormValues["condition"])
            }
            className={inputClass}
          >
            <option value="new">New</option>
            <option value="uk_used">UK-Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </Field>
        <Field label="Price (₦)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Discount price (₦, optional)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.discountPrice}
            onChange={(e) => set("discountPrice", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Stock quantity">
          <input
            type="number"
            min="0"
            step="1"
            value={values.stockQuantity}
            onChange={(e) => set("stockQuantity", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            value={values.status}
            onChange={(e) =>
              set("status", e.target.value as ProductFormValues["status"])
            }
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold_out">Sold out</option>
          </select>
        </Field>
      </div>

      <fieldset className="border-border rounded-xl border p-4">
        <legend className="text-foreground px-1 text-sm font-medium">
          Specifications
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Processor">
            <input
              value={values.processor}
              onChange={(e) => set("processor", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="RAM">
            <input
              value={values.ram}
              onChange={(e) => set("ram", e.target.value)}
              className={inputClass}
              placeholder="e.g. 16GB DDR5"
            />
          </Field>
          <Field label="Storage">
            <input
              value={values.storage}
              onChange={(e) => set("storage", e.target.value)}
              className={inputClass}
              placeholder="e.g. 512GB NVMe SSD"
            />
          </Field>
          <Field label="Screen size">
            <input
              value={values.screenSize}
              onChange={(e) => set("screenSize", e.target.value)}
              className={inputClass}
              placeholder="e.g. 15.6-inch FHD 165Hz"
            />
          </Field>
          <Field label="GPU">
            <input
              value={values.gpu}
              onChange={(e) => set("gpu", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Operating system">
            <input
              value={values.os}
              onChange={(e) => set("os", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Battery (optional)">
            <input
              value={values.battery}
              onChange={(e) => set("battery", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      <Field label="Description">
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
          className={inputClass}
        />
      </Field>

      <Field label="Images">
        <ImageUploader
          images={values.images}
          onChange={(images) => set("images", images)}
        />
      </Field>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : productId ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-foreground block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
