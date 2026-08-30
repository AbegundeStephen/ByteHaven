import { auth } from "@/lib/auth";

export default async function AdminHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-primary text-2xl font-bold">
        Welcome, {session?.user?.name ?? "Admin"}
      </h1>
      <p className="text-muted-foreground mt-2">
        You&apos;re signed in. Product, category, and order management ship in
        later phases.
      </p>
    </div>
  );
}
