"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  total: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface ListResult {
  items: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  paid: "bg-secondary text-secondary-foreground",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-accent text-accent-foreground",
  delivered: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export function OrderTable({ initialResult }: { initialResult: ListResult }) {
  const [result, setResult] = useState(initialResult);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    if (!res.ok) {
      setError("Failed to load orders.");
      return;
    }
    setResult(await res.json());
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchOrders();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, dateFrom, dateTo, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
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
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setPage(1);
            setDateFrom(e.target.value);
          }}
          aria-label="From date"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setPage(1);
            setDateTo(e.target.value);
          }}
          aria-label="To date"
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <div className="border-border bg-card overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="border-border text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((order) => (
              <tr
                key={order.id}
                className="border-border border-b last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-secondary font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3">
                  {naira.format(Number(order.total))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="text-muted-foreground px-4 py-3 capitalize">
                  {order.paymentStatus}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-4 py-6 text-center"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            Page {result.page} of {result.totalPages} ({result.total} orders)
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
