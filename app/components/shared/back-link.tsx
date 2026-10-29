import { Icon } from "@/app/components/icons";

export function BackLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sys-700 hover:underline"
    >
      <Icon name="chevron" size={14} className="rotate-180" />
      {label}
    </button>
  );
}
