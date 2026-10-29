export function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-normal outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
