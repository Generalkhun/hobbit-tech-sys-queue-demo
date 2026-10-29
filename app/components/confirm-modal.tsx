"use client";

import type { ReactNode } from "react";
import { Modal } from "@/app/components/modal";
import { Button } from "@/app/components/ui";

export function ConfirmModal({
  title,
  message,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  danger = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={danger ? "!bg-rose-600 hover:!bg-rose-700" : ""}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-600">{message}</p>
        {children}
      </div>
    </Modal>
  );
}
