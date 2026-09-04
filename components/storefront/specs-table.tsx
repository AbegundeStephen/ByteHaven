const LABELS: Record<string, string> = {
  processor: "Processor",
  ram: "RAM",
  storage: "Storage",
  screen_size: "Screen size",
  gpu: "GPU",
  os: "Operating system",
  battery: "Battery",
};

const ORDER = [
  "processor",
  "ram",
  "storage",
  "screen_size",
  "gpu",
  "os",
  "battery",
];

export function SpecsTable({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs)
    .filter(([, value]) => value)
    .sort(
      ([a], [b]) =>
        (ORDER.indexOf(a) === -1 ? 99 : ORDER.indexOf(a)) -
        (ORDER.indexOf(b) === -1 ? 99 : ORDER.indexOf(b)),
    );

  if (entries.length === 0) return null;

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr key={key} className={i % 2 === 1 ? "bg-muted/50" : undefined}>
              <td className="text-foreground w-1/3 px-4 py-2.5 font-medium">
                {LABELS[key] ?? key}
              </td>
              <td className="text-muted-foreground px-4 py-2.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
