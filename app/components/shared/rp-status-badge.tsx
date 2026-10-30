import type { RPStatus } from "@/app/types/queue";

const rpStyles: Record<RPStatus, { label: string; className: string }> = {
  fastlane: {
    label: "Fastlane",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  normal: {
    label: "Normal",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  limited: {
    label: "Limited",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

export function RPStatusBadge({ status }: { status?: RPStatus }) {
  const style = status ? rpStyles[status] : rpStyles.normal;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function RPStatusSelect({
  value,
  onChange,
}: {
  value?: RPStatus;
  onChange: (value: RPStatus) => void;
}) {
  return (
    <select
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
      value={value ?? "normal"}
      onChange={(e) => onChange(e.target.value as RPStatus)}
    >
      <option value="fastlane">Fastlane (Quality Lead)</option>
      <option value="normal">Normal</option>
      <option value="limited">Limited (จำกัดปริมาณ)</option>
    </select>
  );
}