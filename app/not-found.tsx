import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-primary text-2xl font-bold">
        Byte<span className="text-secondary">Haven</span>
      </p>
      <h1 className="text-foreground mt-6 text-xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground mt-6 inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
