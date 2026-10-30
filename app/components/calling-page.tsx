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
  | { kind: "checkin"; row: OpsTableRow }
  | { kind: "queue"; row: OpsTableRow }
  | { kind: "call"; row: OpsTableRow }
  | { kind: "no-answer"; row: OpsTableRow }
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
  onRecordCheckin,
  onMarkNoAnswer,
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
  onRecordCheckin: (
    id: string,
    atTime: string,
    value?: NoteWithAttachments,
  ) => { error?: string; lateMinutes: number };
  onMarkNoAnswer: (
    id: string,
    value?: NoteWithAttachments,
  ) => { error?: string; count: number };
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
      case "checkin": {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`;
        const result = onRecordCheckin(action.row.booking.id, timeStr, noteValue);
        if (result.error) {
          report(result.error, "");
          setAction(null);
          return;
        }
        const lateText =
          result.lateMinutes >= 10 ? ` · เช็คอินสาย ${result.lateMinutes} นาที` : " · ตรงเวลา";
        report(null, `บันทึกเช็คอิน ${action.row.booking.plate} แล้ว${lateText}`);
        setAction(null);
        return;
      }
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
      case "no-answer": {
        const result = onMarkNoAnswer(action.row.booking.id, noteValue);
        if (result.error) {
          report(result.error, "");
          setAction(null);
          return;
        }
        report(null, `บันทึก รปภ. โทรแล้วไม่รับ (ครั้งที่ ${result.count}) แล้ว`);
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
    checkin: {
      title: "บันทึกเช็คอิน",
      subtitle: "รถมาถึงแล้ว (online หรือ รปภ.) บันทึกเวลาเช็คอินจริง",
      confirmLabel: "บันทึกเช็คอิน",
    },
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
    "no-answer": {
      title: "รปภ. โทรแล้วไม่รับ",
      subtitle: "บันทึกว่ารถไม่รับสาย — รถจะกลับไปรอคิว",
      confirmLabel: "บันทึกโทรไม่รับ",
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
              {status === "confirmed" || status === "waiting" ? (
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-[11px]"
                  onClick={() => openAction({ kind: "checkin", row })}
                >
                  <Icon name="scan" size={12} />
                  เช็คอิน
                </Button>
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
              {status === "call-requested" ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] text-amber-700">รปภ. กำลังโทรเรียก</span>
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-[11px]"
                    onClick={() => openAction({ kind: "no-answer", row })}
                  >
                    <Icon name="close" size={12} />
                    โทรไม่รับ
                  </Button>
                </div>
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
