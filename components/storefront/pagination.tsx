import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Link
        href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`border-input rounded-md border px-3 py-2 text-sm font-medium ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
        }`}
      >
        Previous
      </Link>
      <span className="text-muted-foreground px-3 text-sm">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`border-input rounded-md border px-3 py-2 text-sm font-medium ${
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}
