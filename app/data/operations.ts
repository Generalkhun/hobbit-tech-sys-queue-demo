import type { BookingStatus, QueueBooking } from "@/app/types/queue";

export type OperationTab =
  | "delivering"
  | "confirmed"
  | "call-requested"
  | "awaiting-entry"
  | "received";

export const operationTabs: { id: OperationTab; label: string; statuses: BookingStatus[] }[] = [
  {
    id: "delivering",
    label: "กำลังจัดส่ง",
    statuses: ["confirmed", "waiting", "at-gate", "call-requested", "called"],
  },
  { id: "confirmed", label: "ยืนยัน", statuses: ["at-gate"] },
  { id: "call-requested", label: "ให้เรียกรถยนต์", statuses: ["call-requested"] },
  { id: "awaiting-entry", label: "รอเข้าโรงงาน", statuses: ["called"] },
  { id: "received", label: "รับเข้าโรงงาน", statuses: ["completed"] },
];

/** ข้อความและสีของสถานะในตารางปฏิบัติการ */
export const operationStatusStyle: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: "กำลังจัดส่ง", className: "bg-sky-500" },
  waiting: { label: "กำลังจัดส่ง", className: "bg-sky-500" },
  "at-gate": { label: "ยืนยันแล้ว", className: "bg-emerald-500" },
  "call-requested": { label: "ให้เรียกรถยนต์", className: "bg-amber-500" },
  called: { label: "รอเข้าโรงงาน", className: "bg-violet-500" },
  completed: { label: "รับเข้าโรงงาน", className: "bg-emerald-600" },
};

export function getTodayBookings(bookings: QueueBooking[], date: string) {
  return bookings.filter((booking) => booking.date === date);
}

export function filterByTab(bookings: QueueBooking[], tab: OperationTab) {
  const statuses = operationTabs.find((item) => item.id === tab)?.statuses ?? [];
  return bookings.filter((booking) => statuses.includes(booking.status));
}

export function countByTab(bookings: QueueBooking[]): Record<OperationTab, number> {
  return Object.fromEntries(
    operationTabs.map((tab) => [tab.id, filterByTab(bookings, tab.id).length]),
  ) as Record<OperationTab, number>;
}

/** การ์ดสรุป: "ติดต่อไม่ได้" ยังไม่มีสถานะนี้ในระบบ จึงเป็น 0 เสมอ */
export function getSummaryCounts(bookings: QueueBooking[]) {
  const counts = countByTab(bookings);
  return {
    delivering: counts.delivering,
    callRequested: counts["call-requested"],
    unreachable: 0,
    confirmed: counts.confirmed,
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
