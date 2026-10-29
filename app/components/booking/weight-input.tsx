import { FieldLabel, inputClassName } from "@/app/components/ui";

interface WeightInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function WeightInput({ label, value, onChange }: WeightInputProps) {
  const numericValue = Number(value) || 0;

  return (
    <FieldLabel label={label} required>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`ลด${label} 100 กิโลกรัม`}
          disabled={numericValue <= 0}
          onClick={() => onChange(String(Math.max(0, numericValue - 100)))}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <input
          className={inputClassName}
          type="number"
          min="0"
          step="100"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          type="button"
          aria-label={`เพิ่ม${label} 100 กิโลกรัม`}
          onClick={() => onChange(String(numericValue + 100))}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
        >
          +
        </button>
      </div>
    </FieldLabel>
  );
}
