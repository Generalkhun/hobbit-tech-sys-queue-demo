"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui";

export function Avatar({
  name,
  src,
  size = 32,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initial = name.replace(/^(ร้าน|บริษัท|หจก\.)\s*/, "").charAt(0) || "?";
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full border border-slate-200 object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="grid shrink-0 place-items-center rounded-full bg-sys-50 font-bold text-sys-700"
    >
      {initial}
    </span>
  );
}

const maxBytes = 5 * 1024 * 1024;

export function ProfileEditor({
  name,
  avatar,
  description,
  canEdit,
  onSave,
}: {
  name: string;
  avatar?: string;
  description: string;
  canEdit: boolean;
  onSave: (profile: { avatar?: string; description: string }) => void;
}) {
  const [draftAvatar, setDraftAvatar] = useState(avatar);
  const [draftDescription, setDraftDescription] = useState(description);
  const [error, setError] = useState<string | null>(null);

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("แนบได้เฉพาะไฟล์รูปภาพ");
      return;
    }
    if (file.size > maxBytes) {
      setError("ไฟล์รูปต้องมีขนาดไม่เกิน 5 MB");
      return;
    }
    setError(null);
    setDraftAvatar(URL.createObjectURL(file));
  }

  const dirty = draftAvatar !== avatar || draftDescription !== description;

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="flex flex-col items-center gap-2">
        <Avatar name={name} src={draftAvatar} size={72} />
        {canEdit && (
          <>
            <label className="cursor-pointer text-xs font-semibold text-sys-700 hover:underline">
              เปลี่ยนรูปโปรไฟล์
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="เลือกรูปโปรไฟล์"
                onChange={(event) => {
                  pickFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {draftAvatar && (
              <button
                type="button"
                className="text-[11px] text-slate-400 hover:text-rose-600"
                onClick={() => setDraftAvatar(undefined)}
              >
                ลบรูป
              </button>
            )}
          </>
        )}
      </div>
      <div className="min-w-60 flex-1 space-y-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          รายละเอียด
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50 disabled:bg-slate-50"
            value={draftDescription}
            maxLength={500}
            disabled={!canEdit}
            onChange={(event) => setDraftDescription(event.target.value)}
          />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {canEdit && (
          <Button
            disabled={!dirty}
            onClick={() =>
              onSave({
                avatar: draftAvatar,
                description: draftDescription.trim(),
              })
            }
          >
            บันทึกโปรไฟล์
          </Button>
        )}
      </div>
    </div>
  );
}
