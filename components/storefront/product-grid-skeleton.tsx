export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="border-border bg-card animate-pulse overflow-hidden rounded-xl border"
        >
          <div className="bg-muted aspect-[4/3] w-full" />
          <div className="space-y-2 p-3">
            <div className="bg-muted h-3 w-1/2 rounded" />
            <div className="bg-muted h-4 w-3/4 rounded" />
            <div className="bg-muted h-4 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
