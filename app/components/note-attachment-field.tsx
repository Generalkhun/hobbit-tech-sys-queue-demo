"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import type { NoteAttachment, NoteWithAttachments } from "@/app/types/common";

export type NoteAttachmentValue = NoteWithAttachments;

export const emptyNoteAttachment: NoteAttachmentValue = {
  note: "",
  attachments: [],
};

const maxFiles = 3;
const maxBytes = 5 * 1024 * 1024;

export function NoteAttachmentField({
  value,
  onChange,
  noteLabel = "หมายเหตุ",
  required = false,
  placeholder = "ระบุหมายเหตุ",
}: {
  value: NoteAttachmentValue;
  onChange: (value: NoteAttachmentValue) => void;
  noteLabel?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = [...value.attachments];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("แนบได้เฉพาะไฟล์รูปภาพ");
        continue;
      }
      if (file.size > maxBytes) {
        setError("ไฟล์รูปต้องมีขนาดไม่เกิน 5 MB");
        continue;
      }
      if (next.length >= maxFiles) {
        setError(`แนบรูปได้สูงสุด ${maxFiles} รูป`);
        break;
      }
      setError(null);
      next.push({ name: file.name, url: URL.createObjectURL(file) });
    }
    onChange({ ...value, attachments: next });
  }

  function removeFile(url: string) {
    URL.revokeObjectURL(url);
    setError(null);
    onChange({
      ...value,
      attachments: value.attachments.filter((item) => item.url !== url),
    });
  }

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        <span>
          {noteLabel}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </span>
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
          value={value.note}
          placeholder={placeholder}
          maxLength={500}
          onChange={(event) => onChange({ ...value, note: event.target.value })}
        />
      </label>
      <div className="space-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <Icon name="plus" size={14} />
          แนบรูป (สูงสุด {maxFiles} รูป)
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="แนบรูป"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {value.attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {value.attachments.map((item) => (
              <li
                key={item.url}
                className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={`ลบรูป ${item.name}`}
                  className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-slate-900/70 text-white"
                  onClick={() => removeFile(item.url)}
                >
                  <Icon name="close" size={11} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AttachmentThumbs({
  attachments,
}: {
  attachments: NoteAttachment[];
}) {
  if (attachments.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {attachments.map((item) => (
        <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.name}
            className="h-10 w-10 rounded-md border border-slate-200 object-cover"
          />
        </a>
      ))}
    </div>
  );
}
