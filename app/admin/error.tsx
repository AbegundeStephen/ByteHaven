"use client";

import { useEffect } from "react";

export default function AdminError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-foreground text-xl font-bold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        This screen hit an unexpected error. Try again, or refresh the page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-primary-foreground mt-6 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
