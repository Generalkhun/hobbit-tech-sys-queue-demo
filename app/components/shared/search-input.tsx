import { Icon } from "@/app/components/icons";

export function SearchInput({
  value,
  onChange,
  label,
  placeholder = "ค้นหาข้อมูล...",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Icon
        name="search"
        size={15}
        className="absolute left-3 top-3 text-slate-400"
      />
      <input
        className="h-10 w-56 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      />
    </div>
  );
}
