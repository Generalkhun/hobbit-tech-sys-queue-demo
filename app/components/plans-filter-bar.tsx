import { DatePicker } from "@/app/components/date-picker";
import { FieldLabel, inputClassName, Panel } from "@/app/components/ui";
import type { Plant } from "@/app/types/queue";

export function PlansFilterBar({
  date,
  onDateChange,
  minDate,
  plants,
  plantId,
  onPlantChange,
  hourlyDefault,
  onHourlyDefaultChange,
  disabled = false,
}: {
  date: string;
  onDateChange: (value: string) => void;
  minDate?: string;
  plants: Plant[];
  plantId: string;
  onPlantChange: (value: string) => void;
  hourlyDefault: number;
  onHourlyDefaultChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <Panel className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <FieldLabel label="วันที่">
        <DatePicker value={date} onChange={onDateChange} min={minDate} />
      </FieldLabel>
      <FieldLabel label="โรงงาน">
        <select
          className={inputClassName}
          value={plantId}
          onChange={(event) => onPlantChange(event.target.value)}
        >
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name} · {plant.location}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="รับรถต่อชั่วโมง (ค่าเริ่มต้น · คัน)">
        <input
          className={`${inputClassName} disabled:bg-slate-50 disabled:text-slate-400`}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          disabled={disabled}
          value={hourlyDefault}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) onHourlyDefaultChange(value);
          }}
        />
      </FieldLabel>
    </Panel>
  );
}
