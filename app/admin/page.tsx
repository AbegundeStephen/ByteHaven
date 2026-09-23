import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-primary text-2xl font-bold">
        Welcome, {session?.user?.name ?? "Admin"}
      </h1>
      <p className="text-muted-foreground mt-2">
        Manage the AkinStore catalog and orders.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="border-border bg-card rounded-xl border p-5 hover:shadow-md"
        >
          <h2 className="text-foreground font-semibold">Products</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the catalog and images.
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="border-border bg-card rounded-xl border p-5 hover:shadow-md"
        >
          <h2 className="text-foreground font-semibold">Categories</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Organize how products are browsed.
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="border-border bg-card rounded-xl border p-5 hover:shadow-md"
        >
          <h2 className="text-foreground font-semibold">Orders</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Track and fulfill buyer orders.
          </p>
        </Link>
      </div>
    </div>
  );
}
