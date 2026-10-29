"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { validateImageFile } from "@/app/data/image-file";

export function ImagePicker({
  label,
  value,
  onChange,
  variant = "photo",
  name = "",
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  variant?: "avatar" | "photo";
  /** ใช้แสดงตัวอักษรย่อเมื่อเป็นรูปโปรไฟล์ที่ยังไม่มีรูป */
  name?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file);
    setError(problem);
    if (!problem) onChange(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <div className="flex items-center gap-3">
        {variant === "avatar" ? (
          <Avatar name={name} src={value} size={72} />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="h-24 w-40 rounded-xl border border-slate-200 object-cover"
          />
        ) : (
          <span className="grid h-24 w-40 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-normal text-slate-400">
            ยังไม่มีรูป
          </span>
        )}
        <div className="flex flex-col items-start gap-1.5 text-xs">
          <label className="cursor-pointer font-semibold text-sys-700 hover:underline">
            {value ? "เปลี่ยนรูป" : "เลือกรูป"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label={label}
              onChange={(event) => {
                pick(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              className="text-slate-400 hover:text-rose-600"
              onClick={() => onChange(undefined)}
            >
              ลบรูป
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs font-normal text-rose-600">{error}</p>}
    </div>
  );
}
