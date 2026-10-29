import type { BookingStatus, UserRole } from "@/app/types/queue";

const nextStatuses: Record<BookingStatus, BookingStatus | null> = {
  confirmed: "at-gate",
  waiting: "at-gate",
  "at-gate": "call-requested",
  "call-requested": "called",
  called: "completed",
  completed: null,
};

export function getStatusTransitionError(
  role: UserRole,
  current: BookingStatus,
  next: BookingStatus,
) {
  if (nextStatuses[current] !== next) {
    return `เปลี่ยนสถานะจาก ${current} เป็น ${next} ไม่ได้ตามลำดับคิว`;
  }
  if (
    (next === "at-gate" &&
      role !== "security" &&
      role !== "admin") ||
    (next === "call-requested" &&
      role !== "operations" &&
      role !== "admin") ||
    ((next === "called" || next === "completed") &&
      role !== "security" &&
      role !== "admin")
  ) {
    return "บัญชีนี้ไม่มีสิทธิ์เปลี่ยนสถานะคิวในขั้นตอนนี้";
  }
  return null;
}
