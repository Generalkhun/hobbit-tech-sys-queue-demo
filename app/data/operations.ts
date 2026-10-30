import type { BookingStatus, QueueBooking } from "@/app/types/queue";

export type OperationTab =
  | "delivering"
  | "all"
  | "checked-in"
  | "queueing"
  | "calling"
  | "received";

export const operationTabs: { id: OperationTab; label: string; statuses: BookingStatus[] }[] = [
  {
    id: "delivering",
    label: "กำลังดำเนินการ",
    statuses: [
      "confirmed",
      "waiting",
      "checked-in",
      "at-gate",
      "call-requested",
      "called",
      "no-answer",
    ],
  },
  { id: "all", label: "ทั้งหมด", statuses: [] },
  { id: "checked-in", label: "เช็คอินแล้ว", statuses: ["checked-in"] },
  { id: "queueing", label: "รอจัดคิว / รอเรียก", statuses: ["at-gate", "no-answer"] },
  { id: "calling", label: "แจ้ง รปภ.", statuses: ["call-requested", "called"] },
  { id: "received", label: "ผ่านป้อมแล้ว", statuses: ["completed"] },
];

/**
 * ข้อความและสีของสถานะในตารางปฏิบัติการ
 * สีและเลขขั้นตอนตรงกับผัง "ขั้นตอนการจัดการการจัดส่ง" (DMF)
 * 1 ยังไม่ check-in · 3 รอจัดคิว · 4 รอเรียก · 5 Operation แจ้ง รปภ แล้ว
 * 6.1 รปภ. โทรเรียกแล้ว · 6.2 รปภ. โทรแล้วไม่รับ · 7 ผ่าน รปภ แล้ว
 */
export const operationStatusStyle: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "1. ยังไม่ check-in",
    className: "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200",
  },
  waiting: {
    label: "1. ยังไม่ check-in",
    className: "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200",
  },
  "checked-in": {
    label: "3. รอจัดคิว",
    className: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  },
  "at-gate": {
    label: "4. รอเรียก",
    className: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  },
  "call-requested": {
    label: "5. Operation แจ้ง รปภ. แล้ว",
    className: "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200",
  },
  called: {
    label: "6.1 รปภ. โทรเรียกแล้ว",
    className: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200",
  },
  "no-answer": {
    label: "6.2 รปภ. โทรแล้วไม่รับ",
    className: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200",
  },
  completed: {
    label: "7. ผ่าน รปภ. แล้ว",
    className: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  },
  cancelled: {
    label: "ยกเลิก",
    className: "bg-slate-200 text-slate-600 ring-1 ring-inset ring-slate-300",
  },
};

/** สถานะที่ยังอยู่ใน pipeline (ยังไม่จบ) */
export function isInPipelineStatus(status: BookingStatus) {
  return status !== "completed";
}

export function getTodayBookings(bookings: QueueBooking[], date: string) {
  return bookings.filter((booking) => booking.date === date);
}

export function filterByTab(bookings: QueueBooking[], tab: OperationTab) {
  const statuses = operationTabs.find((item) => item.id === tab)?.statuses ?? [];
  if (statuses.length === 0) return bookings;
  return bookings.filter((booking) => statuses.includes(booking.status));
}

export function countByTab(bookings: QueueBooking[]): Record<OperationTab, number> {
  return Object.fromEntries(
    operationTabs.map((tab) => [tab.id, filterByTab(bookings, tab.id).length]),
  ) as Record<OperationTab, number>;
}

export function getSummaryCounts(bookings: QueueBooking[]) {
  const counts = countByTab(bookings);
  return {
    delivering: counts.delivering,
    callRequested: counts.calling,
    unreachable: counts.queueing,
    confirmed: counts["checked-in"],
  };
}

/** 2026-10-27 → 27/10/2026 */
export function formatDmy(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function getVehicleTypeByPlate(
  vehicles: { plate: string; vehicleType: string }[],
  plate: string,
) {
  return vehicles.find((vehicle) => vehicle.plate === plate)?.vehicleType || "-";
}

/** เวลานัดหมายจาก slot เช่น "09:00–10:00" → "09:00" */
export function slotStart(slot: string) {
  const [start] = slot.split(/[–-]/);
  return start?.trim() ?? slot;
}

/** จำนวนนาทีที่รอแล้ว ตั้งแต่เวลาเช็คอินจนถึงตอนนี้ (สำหรับสถานะรอจัดคิว/โทรไม่ติด) */
export function waitingMinutes(checkinTime: string | undefined, now?: Date) {
  if (!checkinTime) return 0;
  const [hour, minute] = checkinTime.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  const nowDate = now ?? new Date();
  const start = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    hour,
    minute,
  );
  return Math.max(0, Math.floor((nowDate.getTime() - start.getTime()) / 60000));
}

/** เปรียบเทียบเวลา "HH:MM" */
export function compareTime(a: string, b: string) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}
