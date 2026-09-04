"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 flex h-14 w-14 items-center justify-center rounded-full">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="text-destructive h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="text-foreground mt-4 text-xl font-bold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        We hit an unexpected error loading this page. You can try again, or head
        back to the shop.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border-input hover:bg-muted inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
