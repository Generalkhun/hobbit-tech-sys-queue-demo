import type { BookingStatus, UserRole } from "@/app/types/queue";

/**
 * เส้นทางสถานะของใบนำส่ง (ฝั่งรถ / คิว)
 *
 * confirmed ──► checked-in ◄── at-gate (เช็คอินที่ รปภ. → รอจัดคิว)
 *                  │
 *                  └─► at-gate ──► call-requested ──► called ──► completed
 *                                    ▲  (operation แจ้ง รปภ แล้ว)
 *                                    │
 *                              no-answer (รปภ. โทรแล้วไม่รับ) ──► (วนกลับ รอจัดคิว = at-gate)
 *
 * - checked-in: เช็คอินแล้ว (online หรือ รปภ.) → รอจัดคิว
 * - at-gate: จัดคิวแล้ว (รอ ปศ. ดำเนินการ / รอเรียก)
 * - call-requested: ปศ. แจ้ง รปภ. ให้โทรเรียกรถแล้ว
 * - called: รปภ. โทรเรียกแล้ว (รอรถผ่านป้อม)
 * - no-answer: รปภ. โทรแล้วไม่รับ → ปศ. กดวนกลับไป "รอจัดคิว" (at-gate)
 * - completed: รถผ่านป้อมและออกใบนำผ่านแล้ว
 */
export function getNextOperationStatus(
  current: BookingStatus,
): BookingStatus[] {
  switch (current) {
    case "confirmed":
    case "waiting":
      return ["checked-in"];
    case "checked-in":
      return ["at-gate"];
    case "at-gate":
      return ["call-requested"];
    case "call-requested":
      return ["called", "no-answer"];
    case "no-answer":
      // ปศ. กด "ให้โทรอีก" → กลับไปสถานะ 5 (รอ รปภ. โทรเรียกอีกครั้ง)
      return ["call-requested"];
    case "called":
      return ["completed"];
    default:
      return [];
  }
}

/** เช็คว่าสถานะนี้ยัง "รออยู่ใน pipeline" (ยังไม่จบ/ยังไม่ถูกยกเลิก) */
export function isInPipeline(status: BookingStatus) {
  return status !== "completed";
}

/** สถานะที่นับว่า "รถจัดคิวแล้วกำลังรอ" สำหรับการจัดลำดับคิว */
export function isQueuedStatus(status: BookingStatus) {
  return status === "at-gate" || status === "checked-in" || status === "no-answer";
}

export function getStatusTransitionError(
  role: UserRole,
  current: BookingStatus,
  next: BookingStatus,
) {
  const allowed = getNextOperationStatus(current);
  if (!allowed.includes(next)) {
    return `เปลี่ยนสถานะจาก ${current} เป็น ${next} ไม่ได้ตามลำดับคิว`;
  }
  const opsOnly: BookingStatus[] = ["checked-in", "at-gate", "call-requested", "no-answer"];
  if (opsOnly.includes(next) && role !== "operations" && role !== "admin") {
    return "บัญชีนี้ไม่มีสิทธิ์เปลี่ยนสถานะคิวในขั้นตอนนี้";
  }
  if ((next === "called" || next === "completed") && role !== "security" && role !== "admin") {
    return "บัญชีนี้ไม่มีสิทธิ์เปลี่ยนสถานะคิวในขั้นตอนนี้";
  }
  return null;
}
