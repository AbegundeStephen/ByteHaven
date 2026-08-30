export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="border-border bg-card animate-pulse overflow-hidden rounded-xl border"
      aria-hidden="true"
    >
      <div className="border-border bg-muted/50 h-10 border-b" />
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="border-border flex items-center gap-4 border-b p-4 last:border-0"
        >
          <div className="bg-muted h-4 w-24 rounded" />
          <div className="bg-muted h-4 w-32 rounded" />
          <div className="bg-muted h-4 w-20 rounded" />
          <div className="bg-muted h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
