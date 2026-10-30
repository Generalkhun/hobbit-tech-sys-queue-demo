"use client";

import { useMemo } from "react";
import { inputClassName } from "@/app/components/ui";
import { provinces } from "@/app/data/directories";

const provinceListId = "province-options";

/** ช่องจังหวัดพร้อมรายการแนะนำจากข้อมูลจังหวัดของระบบ (มีรหัสจังหวัดกำกับ) */
export function ProvinceField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const options = useMemo(
    () =>
      provinces.map((province) => ({
        name: province.name,
        code: province.code,
      })),
    [],
  );

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
        {options.map((province) => (
          <option key={province.code} value={province.name}>
            {province.name} ({province.code})
          </option>
        ))}
      </datalist>
    </label>
  );
}
