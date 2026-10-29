"use client";

import { ImagePicker } from "@/app/components/shared/image-picker";
import { ProvinceField } from "@/app/components/shared/province-field";
import type { SellerLocation } from "@/app/types/seller";

export function LocationFields({
  value,
  onChange,
  disabled = false,
  photoLabel = "รูปถ่ายหน้าร้าน/สำนักงาน",
}: {
  value: SellerLocation;
  onChange: (value: SellerLocation) => void;
  disabled?: boolean;
  photoLabel?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ProvinceField
        value={value.province}
        disabled={disabled}
        onChange={(province) => onChange({ ...value, province })}
      />
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        ที่อยู่
        <textarea
          className="min-h-20 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50 disabled:bg-slate-50"
          value={value.address}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, address: event.target.value })}
        />
      </label>
      <div className="sm:col-span-2">
        {disabled ? (
          <ReadOnlyPhoto label={photoLabel} src={value.photo} />
        ) : (
          <ImagePicker
            label={photoLabel}
            value={value.photo}
            onChange={(photo) => onChange({ ...value, photo })}
          />
        )}
      </div>
    </div>
  );
}

function ReadOnlyPhoto({ label, src }: { label: string; src?: string }) {
  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="h-24 w-40 rounded-xl border border-slate-200 object-cover"
        />
      ) : (
        <span className="text-xs font-normal text-slate-400">ยังไม่มีรูป</span>
      )}
    </div>
  );
}
