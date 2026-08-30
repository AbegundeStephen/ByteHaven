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
      <h1 className="text-foreground text-xl font-bold">
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
          className="bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border-input hover:bg-muted inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
