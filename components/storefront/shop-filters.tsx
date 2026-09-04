"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ShopFiltersProps {
  categories: { id: string; slug: string; name: string }[];
  brands: string[];
  lockedCategorySlug?: string;
}

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "uk_used", label: "UK-Used" },
  { value: "refurbished", label: "Refurbished" },
];

const inputClass =
  "border-input bg-background focus:ring-ring mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-shadow focus:ring-2";

export function ShopFilters({
  categories,
  brands,
  lockedCategorySlug,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentBrands =
    searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const currentConditions =
    searchParams.get("condition")?.split(",").filter(Boolean) ?? [];

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleCategoryChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const query = params.toString();
    router.push(
      slug
        ? `/shop/${slug}${query ? `?${query}` : ""}`
        : `/shop${query ? `?${query}` : ""}`,
    );
  }

  function toggleListValue(
    key: "brand" | "condition",
    value: string,
    current: string[],
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length ? next.join(",") : null });
  }

  const content = (
    <div className="border-border bg-card space-y-6 rounded-xl border p-5 shadow-sm">
      <div>
        <label
          htmlFor="filter-search"
          className="text-foreground block text-sm font-medium"
        >
          Search
        </label>
        <input
          id="filter-search"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParams({ q: e.target.value || null })}
          placeholder="Search products…"
          className={inputClass}
        />
      </div>

      {!lockedCategorySlug && (
        <div>
          <label
            htmlFor="filter-category"
            className="text-foreground block text-sm font-medium"
          >
            Category
          </label>
          <select
            id="filter-category"
            defaultValue=""
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="text-foreground text-sm font-medium">Condition</p>
        <div className="mt-2 space-y-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={currentConditions.includes(c.value)}
                onChange={() =>
                  toggleListValue("condition", c.value, currentConditions)
                }
                className="accent-secondary h-4 w-4 rounded"
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <p className="text-foreground text-sm font-medium">Brand</p>
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={currentBrands.includes(brand)}
                  onChange={() =>
                    toggleListValue("brand", brand, currentBrands)
                  }
                  className="accent-secondary h-4 w-4 rounded"
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-foreground text-sm font-medium">Price range (₦)</p>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor="filter-min-price" className="sr-only">
            Minimum price
          </label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
            className={`${inputClass} mt-0`}
          />
          <span className="text-muted-foreground">–</span>
          <label htmlFor="filter-max-price" className="sr-only">
            Maximum price
          </label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
            className={`${inputClass} mt-0`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="filter-ram"
          className="text-foreground block text-sm font-medium"
        >
          RAM
        </label>
        <input
          id="filter-ram"
          defaultValue={searchParams.get("ram") ?? ""}
          onBlur={(e) => updateParams({ ram: e.target.value || null })}
          placeholder="e.g. 16GB"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="filter-storage"
          className="text-foreground block text-sm font-medium"
        >
          Storage
        </label>
        <input
          id="filter-storage"
          defaultValue={searchParams.get("storage") ?? ""}
          onBlur={(e) => updateParams({ storage: e.target.value || null })}
          placeholder="e.g. 512GB"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="filter-screen-size"
          className="text-foreground block text-sm font-medium"
        >
          Screen size
        </label>
        <input
          id="filter-screen-size"
          defaultValue={searchParams.get("screenSize") ?? ""}
          onBlur={(e) => updateParams({ screenSize: e.target.value || null })}
          placeholder="e.g. 15.6-inch"
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="border-input bg-background flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="M10 3a1 1 0 0 1 1 1v1.5h5a1 1 0 1 1 0 2h-5V9a1 1 0 1 1-2 0V7.5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Zm-6 11a1 1 0 0 1 1-1h5v-1.5a1 1 0 1 1 2 0V13h5a1 1 0 1 1 0 2h-5v1.5a1 1 0 1 1-2 0V15H5a1 1 0 0 1-1-1Z" />
          </svg>
          {open ? "Hide filters" : "Show filters"}
        </button>
        {open && <div className="mt-4">{content}</div>}
      </div>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">{content}</aside>
    </>
  );
}
