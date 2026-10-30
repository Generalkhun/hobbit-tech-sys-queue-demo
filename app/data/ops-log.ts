import type { NoteAttachment } from "@/app/types/common";
import type { BookingStatus, QueueBooking } from "@/app/types/queue";

/** หนึ่งรายการ log ของการดำเนินการใน pipeline */
export interface OpsLogEntry {
  id: string;
  bookingId: string;
  booking: Pick<
    QueueBooking,
    | "id"
    | "retailer"
    | "broker"
    | "plate"
    | "grade"
    | "plantId"
    | "driver"
    | "date"
  >;
  /** สถานะก่อนและหลังเปลี่ยน */
  from: BookingStatus;
  to: BookingStatus;
  /** ข้อความกำกับ (เช่น "สาย 12 นาที", "โทรแล้วไม่รับครั้งที่ 2") */
  actionLabel: string;
  note: string;
  attachments: NoteAttachment[];
  actor: string;
  /** ISO timestamp */
  at: string;
}

const storage: OpsLogEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeToOpsLogs(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOpsLogs(date?: string): OpsLogEntry[] {
  if (!date) return [...storage];
  return storage.filter((entry) => entry.booking.date === date);
}

export function addOpsLog(entry: OpsLogEntry) {
  storage.push(entry);
  notify();
}

export function pickBooking(booking: QueueBooking): OpsLogEntry["booking"] {
  return {
    id: booking.id,
    retailer: booking.retailer,
    broker: booking.broker,
    plate: booking.plate,
    grade: booking.grade,
    plantId: booking.plantId,
    driver: booking.driver,
    date: booking.date,
  };
}

export function createOpsLog({
  booking,
  from,
  to,
  actionLabel,
  note = "",
  attachments = [],
  actor,
  at,
}: {
  booking: QueueBooking;
  from: BookingStatus;
  to: BookingStatus;
  actionLabel: string;
  note?: string;
  attachments?: NoteAttachment[];
  actor: string;
  at: string;
}): OpsLogEntry {
  return {
    id: `OP-${Date.now().toString(36)}-${storage.length + 1}`,
    bookingId: booking.id,
    booking: pickBooking(booking),
    from,
    to,
    actionLabel,
    note,
    attachments,
    actor,
    at,
  };
}