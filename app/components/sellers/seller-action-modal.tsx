"use client";

import { useState } from "react";
import { ConfirmModal } from "@/app/components/confirm-modal";
import {
  NoteAttachmentField,
  emptyNoteAttachment,
} from "@/app/components/note-attachment-field";
import { inputClassName } from "@/app/components/ui";
import { NO_SELLER_LABEL } from "@/app/data/sellers";
import type { NoteWithAttachments } from "@/app/types/common";
import type { Seller, SellerShop } from "@/app/types/seller";

export type SellerAction =
  | { kind: "suspend" }
  | { kind: "release" }
  | { kind: "move-in"; shopId: string }
  | { kind: "move-out"; shopId: string };

export function SellerActionModal({
  action,
  seller,
  sellers,
  shops,
  onConfirm,
  onCancel,
}: {
  action: SellerAction;
  seller: Seller;
  sellers: Seller[];
  shops: SellerShop[];
  onConfirm: (value: NoteWithAttachments, targetSellerId: string | null) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<NoteWithAttachments>(emptyNoteAttachment);
  const [target, setTarget] = useState("");
  const shopName =
    "shopId" in action
      ? shops.find((shop) => shop.id === action.shopId)?.name
      : undefined;
  const isSuspend = action.kind === "suspend";

  const copy = {
    suspend: {
      title: "ยืนยันการระงับผู้ขาย",
      message: `เมื่อระงับ "${seller.name}" และร้านค้าในสังกัดจะไม่สามารถจองคิวได้จนกว่าจะปลดการระงับ`,
      confirm: "ยืนยันการระงับ",
    },
    release: {
      title: "ยืนยันการปลดการระงับ",
      message: `ปลดการระงับ "${seller.name}" เพื่อให้กลับมาจองคิวได้`,
      confirm: "ยืนยันการปลดระงับ",
    },
    "move-in": {
      title: "ยืนยันการย้ายร้านค้าเข้า",
      message: `ย้าย "${shopName}" เข้าสังกัด "${seller.name}"`,
      confirm: "ยืนยันการย้าย",
    },
    "move-out": {
      title: "ยืนยันการย้ายร้านค้าออก",
      message: `ย้าย "${shopName}" ออกจากสังกัด "${seller.name}" โดยเลือกปลายทางด้านล่าง`,
      confirm: "ยืนยันการย้าย",
    },
  }[action.kind];

  return (
    <ConfirmModal
      title={copy.title}
      message={copy.message}
      confirmLabel={copy.confirm}
      danger={isSuspend}
      confirmDisabled={isSuspend && !draft.note.trim()}
      onConfirm={() =>
        onConfirm(draft, action.kind === "move-in" ? seller.id : target || null)
      }
      onCancel={onCancel}
    >
      {action.kind === "move-out" && (
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          ย้ายไปยัง
          <select
            className={inputClassName}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            <option value="">{NO_SELLER_LABEL} (ร้านค้าที่ไม่มีผู้ขาย)</option>
            {sellers
              .filter((item) => item.id !== seller.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </label>
      )}
      <NoteAttachmentField value={draft} onChange={setDraft} required={isSuspend} />
    </ConfirmModal>
  );
}
