export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-muted aspect-square w-full animate-pulse rounded-xl" />
        <div className="space-y-4">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-6 w-32 animate-pulse rounded" />
          <div className="bg-muted h-10 w-40 animate-pulse rounded" />
          <div className="bg-muted h-32 w-full animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
