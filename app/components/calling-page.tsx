"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { DatePicker } from "@/app/components/date-picker";
import { Modal } from "@/app/components/modal";
import { OpsGuidanceFlow } from "@/app/components/operations/ops-guidance-flow";
import { OpsSlotStrip } from "@/app/components/operations/ops-slot-strip";
import {
  OperationsTable,
  type OpsTableRow,
} from "@/app/components/operations/operations-table";
import {
  emptyNoteAttachment,
  NoteAttachmentField,
} from "@/app/components/note-attachment-field";
import { Button } from "@/app/components/ui";
import { demoDate } from "@/app/data/mock-data";
import { getTodayBookings } from "@/app/data/operations";
import type { SlotCapacityConfig } from "@/app/data/slot-capacity";
import type {
  CheckinTimes,
  NoAnswerCounts,
  PlanRow,
  QueueBooking,
} from "@/app/types/queue";
import type { NoteWithAttachments } from "@/app/types/common";

type OpsAction =
  | { kind: "queue"; row: OpsTableRow }
  | { kind: "call"; row: OpsTableRow }
  | { kind: "recall"; row: OpsTableRow }
  | null;

export function CallingPage({
  bookings,
  plans,
  vehicles,
  capacityConfig,
  checkinTimes,
  noAnswerCounts,
  grades,
  onTransition,
}: {
  bookings: QueueBooking[];
  plans: PlanRow[];
  vehicles: { plate: string; vehicleType: string }[];
  capacityConfig: SlotCapacityConfig;
  checkinTimes: CheckinTimes;
  noAnswerCounts: NoAnswerCounts;
  grades: string[];
  onTransition: (
    id: string,
    to: QueueBooking["status"],
    value?: NoteWithAttachments,
    actionLabel?: string,
  ) => string | null;
}) {
  const [date, setDate] = useState(demoDate);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [action, setAction] = useState<OpsAction>(null);
  const [noteValue, setNoteValue] = useState<NoteWithAttachments>(emptyNoteAttachment);

  const today = getTodayBookings(bookings, date);

  function report(error: string | null, success: string) {
    setNotice({ text: error ?? success, error: Boolean(error) });
  }

  function openAction(next: OpsAction) {
    setNoteValue(emptyNoteAttachment);
    setAction(next);
  }

  function runAction() {
    if (!action) return;
    switch (action.kind) {
      case "queue": {
        const error = onTransition(
          action.row.booking.id,
          "at-gate",
          noteValue,
          "จัดคิวแล้ว (รอเรียก)",
        );
        report(error, `จัดคิว ${action.row.booking.plate} แล้ว (รอเรียก)`);
        setAction(null);
        return;
      }
      case "call": {
        const error = onTransition(
          action.row.booking.id,
          "call-requested",
          noteValue,
          "ปศ. แจ้ง รปภ. ให้โทรเรียกรถ",
        );
        report(error, `แจ้ง รปภ. ให้โทรเรียกรถ ${action.row.booking.plate} แล้ว`);
        setAction(null);
        return;
      }
      case "recall": {
        const error = onTransition(
          action.row.booking.id,
          "checked-in",
          noteValue,
          "กลับมารอคิวใหม่ (โทรไม่รับ)",
        );
        report(error, `${action.row.booking.plate} กลับมารอคิวแล้ว`);
        setAction(null);
        return;
      }
    }
  }

  const actionMeta: Record<
    NonNullable<OpsAction>["kind"],
    { title: string; subtitle: string; confirmLabel: string }
  > = {
    queue: {
      title: "จัดคิวแล้ว",
      subtitle: "ยืนยันว่ารถเข้าสู่คิวรอเรียกแล้ว",
      confirmLabel: "ยืนยันจัดคิว",
    },
    call: {
      title: "แจ้ง รปภ. ให้โทรเรียกรถ",
      subtitle: "รถพร้อมให้เรียกเข้าโรงงาน — operation แจ้ง รปภ. แล้ว",
      confirmLabel: "แจ้ง รปภ.",
    },
    recall: {
      title: "กลับมารอคิว",
      subtitle: "รถกลับเข้าคิวรอเรียกอีกครั้ง (จากโทรไม่รับ)",
      confirmLabel: "กลับมารอคิว",
    },
  };

  return (
    <div className="space-y-6">
      {/* เลือกวัน */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">วันที่จัดคิว</p>
          <DatePicker value={date} onChange={setDate} />
        </div>
        <p className="pb-2 text-xs text-slate-400">
          {today.length} ใบ · วันที่เลือก
        </p>
      </div>

      {/* guidance flow */}
      <OpsGuidanceFlow />

      {notice && (
        <p
          role={notice.error ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-xs ${
            notice.error
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* ตารางรายการ */}
      <OperationsTable
        bookings={today}
        vehicles={vehicles}
        checkinTimes={checkinTimes}
        noAnswerCounts={noAnswerCounts}
        grades={grades}
        onRefresh={() => {
          const now = new Date();
          report(
            null,
            `รีเฟรชล่าสุด ${now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`,
          );
        }}
        renderAction={(row) => {
          const { booking } = row;
          const status = booking.status;
          return (
            <div className="flex flex-col items-end gap-1.5">
              {/* 1. ยังไม่ check-in — รถต้องเช็คอินเอง ไม่มีปุ่มให้ ปศ. กด */}
              {status === "confirmed" || status === "waiting" ? (
                <span className="text-[11px] text-slate-400">รอรถเช็คอินเอง</span>
              ) : null}
              {status === "checked-in" ? (
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-[11px]"
                  onClick={() => openAction({ kind: "queue", row })}
                >
                  <Icon name="check" size={12} />
                  จัดคิว
                </Button>
              ) : null}
              {status === "at-gate" ? (
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-[11px]"
                  onClick={() => openAction({ kind: "call", row })}
                >
                  <Icon name="phone" size={12} />
                  โทรแจ้ง
                </Button>
              ) : null}
              {/* 5. Operation แจ้ง รปภ แล้ว — รอ รปภ. โทร (ถ้าไม่รับ รปภ. กดในระบบเอง) */}
              {status === "call-requested" ? (
                <span className="text-[11px] text-amber-700">รอ รปภ. โทรเรียก</span>
              ) : null}
              {status === "no-answer" ? (
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-[11px]"
                  onClick={() => openAction({ kind: "recall", row })}
                >
                  <Icon name="refresh" size={12} />
                  กลับมารอคิว
                </Button>
              ) : null}
              {status === "called" ? (
                <span className="text-[11px] text-violet-700">รอรถผ่านป้อมพร้อมใบนำผ่าน</span>
              ) : null}
            </div>
          );
        }}
      />

      {/* slot pipeline */}
      <OpsSlotStrip
        date={date}
        bookDate={date}
        plans={plans}
        bookings={bookings}
        capacityConfig={capacityConfig}
      />

      {/* modal ยืนยัน + หมายเหตุ/รูป */}
      {action && (
        <Modal
          title={actionMeta[action.kind].title}
          subtitle={actionMeta[action.kind].subtitle}
          onClose={() => setAction(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAction(null)}>
                ยกเลิก
              </Button>
              <Button onClick={runAction}>
                {actionMeta[action.kind].confirmLabel}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
              <p className="font-semibold text-slate-800">
                {action.row.booking.id} · {action.row.booking.plate}
              </p>
              <p className="mt-1">
                {action.row.booking.retailer} · นัด {action.row.booking.timeSlot} น.
                {action.row.checkinTime && ` · เช็คอิน ${action.row.checkinTime} น.`}
              </p>
            </div>
            <NoteAttachmentField value={noteValue} onChange={setNoteValue} />
          </div>
        </Modal>
      )}
    </div>
  );
}
