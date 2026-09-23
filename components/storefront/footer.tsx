import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      <div
        aria-hidden="true"
        className="from-secondary via-accent to-secondary absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-60"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold">
              Akin<span className="text-accent">Store</span>
            </p>
            <p className="text-primary-foreground/70 mt-1 max-w-xs text-sm">
              Quality Laptops. Verified Deals. Delivered With Trust.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex gap-6 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-primary-foreground/60 text-sm">
            <p>
              &copy; {new Date().getFullYear()} AkinStore. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
