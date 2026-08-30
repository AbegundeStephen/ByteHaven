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
    <table className="w-full text-sm">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key} className="border-border border-b last:border-0">
            <td className="text-foreground py-2 pr-4 font-medium">
              {LABELS[key] ?? key}
            </td>
            <td className="text-muted-foreground py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
