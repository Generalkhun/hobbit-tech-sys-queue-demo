"use client";

import { useState } from "react";
import { ConfirmModal } from "@/app/components/confirm-modal";
import {
  NoteAttachmentField,
  emptyNoteAttachment,
} from "@/app/components/note-attachment-field";
import type { NoteWithAttachments } from "@/app/types/common";
import type { RegistryStatusAction } from "@/app/types/registry";

const copy: Record<RegistryStatusAction, { title: string; confirm: string; message: string }> = {
  approve: {
    title: "ยืนยันการอนุมัติ",
    confirm: "ยืนยันการอนุมัติ",
    message: "อนุมัติเพื่อให้ใช้งานในการสร้างใบนำส่งได้",
  },
  suspend: {
    title: "ยืนยันการระงับ",
    confirm: "ยืนยันการระงับ",
    message: "เมื่อระงับจะไม่สามารถเลือกใช้ในใบนำส่งได้จนกว่าจะปลดการระงับ",
  },
  release: {
    title: "ยืนยันการปลดการระงับ",
    confirm: "ยืนยันการปลดระงับ",
    message: "ปลดการระงับเพื่อให้กลับมาใช้งานได้",
  },
};

export function StatusActionModal({
  action,
  targetName,
  onConfirm,
  onCancel,
}: {
  action: RegistryStatusAction;
  targetName: string;
  onConfirm: (value: NoteWithAttachments) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<NoteWithAttachments>(emptyNoteAttachment);
  const text = copy[action];
  const isSuspend = action === "suspend";

  return (
    <ConfirmModal
      title={text.title}
      message={`${targetName}: ${text.message}`}
      confirmLabel={text.confirm}
      danger={isSuspend}
      confirmDisabled={isSuspend && !draft.note.trim()}
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
    >
      <NoteAttachmentField value={draft} onChange={setDraft} required={isSuspend} />
    </ConfirmModal>
  );
}
