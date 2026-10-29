"use client";

import { useState } from "react";
import { ConfirmModal } from "@/app/components/confirm-modal";
import {
  NoteAttachmentField,
  emptyNoteAttachment,
} from "@/app/components/note-attachment-field";
import { inputClassName } from "@/app/components/ui";
import { NO_SELLER_LABEL, getSellerName } from "@/app/data/sellers";
import type { NoteWithAttachments } from "@/app/types/common";
import type { Seller, SellerShop } from "@/app/types/seller";

export function ShopMoveModal({
  shop,
  sellers,
  onConfirm,
  onCancel,
}: {
  shop: SellerShop;
  sellers: Seller[];
  onConfirm: (toSellerId: string | null, value: NoteWithAttachments) => void;
  onCancel: () => void;
}) {
  const [target, setTarget] = useState(shop.sellerId ?? "");
  const [draft, setDraft] = useState<NoteWithAttachments>(emptyNoteAttachment);
  const toSellerId = target || null;

  return (
    <ConfirmModal
      title="ยืนยันการย้ายผู้ขาย"
      message={`ย้าย "${shop.name}" จาก "${getSellerName(sellers, shop.sellerId)}" ไปยัง "${getSellerName(sellers, toSellerId)}"`}
      confirmLabel="ยืนยันการย้าย"
      confirmDisabled={toSellerId === shop.sellerId}
      onConfirm={() => onConfirm(toSellerId, draft)}
      onCancel={onCancel}
    >
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        ผู้ขายปลายทาง
        <select
          className={inputClassName}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        >
          <option value="">{NO_SELLER_LABEL}</option>
          {sellers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <NoteAttachmentField value={draft} onChange={setDraft} />
    </ConfirmModal>
  );
}
