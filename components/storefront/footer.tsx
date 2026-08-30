import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="border-border bg-primary text-primary-foreground border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold">
              Byte<span className="text-accent">Haven</span>
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

          <div className="text-primary-foreground/70 text-sm">
            <p>
              &copy; {new Date().getFullYear()} ByteHaven. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
