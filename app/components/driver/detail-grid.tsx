import type { DetailItem } from "@/app/types/driver-portal";

export function DetailGrid({
  items,
  className = "",
}: {
  items: DetailItem[];
  className?: string;
}) {
  return (
    <div className={`${className}grid gap-3 sm:grid-cols-2`}>
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
        </div>
      ))}
    </div>
  );
}
