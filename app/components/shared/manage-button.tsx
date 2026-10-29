export function ManageButton({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`จัดการ ${name}`}
      onClick={onClick}
      className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-sys-700 hover:bg-sys-50"
    >
      จัดการ
    </button>
  );
}
