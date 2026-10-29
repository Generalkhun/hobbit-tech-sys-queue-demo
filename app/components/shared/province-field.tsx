"use client";

import { inputClassName } from "@/app/components/ui";
import { directoryRecords } from "@/app/data/mocks/directories";

const provinceListId = "province-options";

/** ช่องจังหวัดพร้อมรายการแนะนำจากข้อมูลจังหวัดของระบบ */
export function ProvinceField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      จังหวัด
      <input
        className={inputClassName}
        list={provinceListId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={provinceListId}>
        {directoryRecords.provinces.map((province) => (
          <option key={province.id} value={province.name} />
        ))}
      </datalist>
    </label>
  );
}
