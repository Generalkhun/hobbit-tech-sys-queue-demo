"use client";

import { ImagePicker } from "@/app/components/shared/image-picker";
import type { SellerProfile } from "@/app/types/seller";

export function ProfileFields({
  name,
  value,
  onChange,
}: {
  name: string;
  value: SellerProfile;
  onChange: (value: SellerProfile) => void;
}) {
  return (
    <div className="flex flex-wrap items-start gap-5">
      <ImagePicker
        label="รูปโปรไฟล์"
        variant="avatar"
        name={name}
        value={value.avatar}
        onChange={(avatar) => onChange({ ...value, avatar })}
      />
      <label className="flex min-w-60 flex-1 flex-col gap-2 text-sm font-medium text-slate-700">
        รายละเอียด
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
          value={value.description}
          maxLength={500}
          onChange={(event) => onChange({ ...value, description: event.target.value })}
        />
      </label>
    </div>
  );
}
