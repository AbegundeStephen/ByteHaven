import Link from "next/link";
import { CartButton } from "@/components/storefront/cart-button";

export function Header() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-primary text-xl font-bold tracking-tight">
            Byte<span className="text-secondary">Haven</span>
          </span>
        </Link>

        <nav className="text-foreground hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/shop" className="hover:text-secondary transition-colors">
            Shop
          </Link>
          <Link
            href="/track-order"
            className="hover:text-secondary transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/about"
            className="hover:text-secondary transition-colors"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
