import { DEMAND_STEP_KG, adjustKg } from "@/app/data/plan-calendar";

/** ช่องตัวเลขกิโลกรัมที่กด + / − ได้ทีละ 100 กก. */
export function KgStepper({
  label,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const buttonClass =
    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`ลด${label} ${DEMAND_STEP_KG} กิโลกรัม`}
        disabled={disabled || value <= 0}
        onClick={() => onChange(adjustKg(value, -DEMAND_STEP_KG))}
        className={buttonClass}
      >
        −
      </button>
      <input
        aria-label={label}
        className="h-10 w-28 rounded-xl border border-slate-200 px-3 text-right text-sm outline-none focus:border-sys-400 disabled:bg-slate-50 disabled:text-slate-400"
        type="number"
        min={0}
        step={DEMAND_STEP_KG}
        inputMode="numeric"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
      />
      <button
        type="button"
        aria-label={`เพิ่ม${label} ${DEMAND_STEP_KG} กิโลกรัม`}
        disabled={disabled}
        onClick={() => onChange(adjustKg(value, DEMAND_STEP_KG))}
        className={buttonClass}
      >
        +
      </button>
      <span className="w-6 text-xs text-slate-400">กก.</span>
    </div>
  );
}
