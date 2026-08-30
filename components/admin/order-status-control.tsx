"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusControlProps {
  orderId: string;
  currentStatus: string;
  validNextStatuses: string[];
}

const LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusControl({
  orderId,
  currentStatus,
  validNextStatuses,
}: OrderStatusControlProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(validNextStatuses[0] ?? "");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (validNextStatuses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        This order is in a final state and cannot be updated further.
      </p>
    );
  }

  async function handleUpdate() {
    setError(null);
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected }),
    });
    setUpdating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to update status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-muted-foreground text-sm">
        Current:{" "}
        <span className="text-foreground font-medium">
          {LABELS[currentStatus]}
        </span>
      </span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        aria-label="New order status"
        className="border-input bg-background rounded-md border px-3 py-2 text-sm"
      >
        {validNextStatuses.map((s) => (
          <option key={s} value={s}>
            Move to {LABELS[s]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={updating}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
      >
        {updating ? "Updating…" : "Update Status"}
      </button>
      {error && (
        <p className="text-destructive w-full text-sm font-medium">{error}</p>
      )}
    </div>
  );
}
