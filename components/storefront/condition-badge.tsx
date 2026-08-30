import type { ProductCondition } from "@/lib/generated/prisma/client";

const LABELS: Record<ProductCondition, string> = {
  new: "New",
  uk_used: "UK-Used",
  refurbished: "Refurbished",
};

const STYLES: Record<ProductCondition, string> = {
  new: "bg-secondary text-secondary-foreground",
  uk_used: "bg-accent text-accent-foreground",
  refurbished: "bg-muted text-muted-foreground",
};

export function ConditionBadge({
  condition,
  className = "",
}: {
  condition: ProductCondition;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[condition]} ${className}`}
    >
      {LABELS[condition]}
    </span>
  );
}
