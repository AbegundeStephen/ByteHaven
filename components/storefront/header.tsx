"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartButton } from "@/components/storefront/cart-button";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-primary text-xl font-bold tracking-tight transition-transform duration-200 group-hover:scale-[1.03]">
            Byte<span className="text-secondary">Haven</span>
          </span>
        </Link>

        <nav className="text-foreground hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group hover:text-secondary relative py-1 transition-colors"
            >
              {link.label}
              <span className="bg-secondary absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <CartButton />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="hover:bg-muted flex h-11 w-11 items-center justify-center rounded-lg transition-colors md:hidden"
          >
            {mobileOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`border-border bg-background grid overflow-hidden border-t px-4 transition-all duration-300 ease-out md:hidden ${
          mobileOpen
            ? "grid-rows-[1fr] py-3 opacity-100"
            : "grid-rows-[0fr] py-0 opacity-0"
        }`}
      >
        <ul className="flex min-h-0 flex-col">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-foreground hover:text-secondary flex h-11 items-center text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
