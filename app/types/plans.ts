import type { GradeCapacities } from "@/app/data/slot-capacity";

export interface SavedPlanDay {
  locked: boolean;
  savedAt: string;
}

export interface SlotView {
  slot: string;
  closedReason?: string;
  manualClosure?: string;
  /** slot นี้ถูกปิดถาวรเพราะเป็นช่วง rush hour (ยังไม่ได้เปิดรับกลับ) */
  rushHourClosed?: boolean;
  /** slot นี้เป็น rush hour แต่ถูกเปิดรับกลับแล้ว */
  rushHourReopened?: boolean;
  capacities: GradeCapacities;
  booked: Record<string, number>;
  customized: boolean;
}

/** ปริมาณเหล็กที่ต้องการรับ (กก.) แยกตามเกรด */
export type DemandKgByGrade = Record<string, number>;

/** วันที่ (YYYY-MM-DD) → เกรด → กก. (ปริมาณรวมทุกโรงงาน) */
export type DailyDemand = Record<string, DemandKgByGrade>;
