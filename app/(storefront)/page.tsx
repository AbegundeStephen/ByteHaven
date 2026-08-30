import Link from "next/link";

const conditions = [
  { label: "New", className: "bg-secondary text-secondary-foreground" },
  { label: "UK-Used", className: "bg-accent text-accent-foreground" },
  { label: "Refurbished", className: "bg-muted text-muted-foreground" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="bg-primary text-primary-foreground rounded-2xl px-6 py-16 sm:px-12">
        <p className="text-accent text-sm font-semibold tracking-wide uppercase">
          Project scaffold — Phase 0
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Quality Laptops. Verified Deals. Delivered With Trust.
        </h1>
        <p className="text-primary-foreground/80 mt-4 max-w-xl">
          This is a placeholder home page confirming the ByteHaven design system
          (navy + teal + warm gold) and base layout are wired up correctly. Real
          storefront content ships in Phase 4.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {conditions.map((c) => (
            <span
              key={c.label}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${c.className}`}
            >
              {c.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-primary font-semibold">Navy</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Primary brand color — trust, headers, primary actions.
          </p>
        </div>
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="text-secondary font-semibold">Teal</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Secondary color — freshness, links, focus states.
          </p>
        </div>
        <div className="border-border bg-card rounded-xl border p-6">
          <h2 className="font-semibold" style={{ color: "var(--accent)" }}>
            Warm Gold
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Accent color — deals, callouts, condition badges.
          </p>
        </div>
      </section>

      <div className="mt-12">
        <Link
          href="/shop"
          className="bg-secondary text-secondary-foreground inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors hover:opacity-90"
        >
          Browse Shop (coming in Phase 4)
        </Link>
      </div>
    </div>
  );
}
