import type { Metadata } from "next";
import { listOrders } from "@/lib/orders";
import { OrderTable } from "@/components/admin/order-table";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage() {
  const initialResult = await listOrders({ pageSize: 20 });

  return (
    <div>
      <h1 className="text-primary text-2xl font-bold">Orders</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        View and manage buyer orders.
      </p>

      <div className="mt-6">
        <OrderTable initialResult={JSON.parse(JSON.stringify(initialResult))} />
      </div>
    </div>
  );
}
