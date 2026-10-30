import type { GradeCapacities } from "@/app/data/slot-capacity";

export interface SavedPlanDay {
  locked: boolean;
  savedAt: string;
}

export interface SlotView {
  slot: string;
  closedReason?: string;
  manualClosure?: string;
  capacities: GradeCapacities;
  booked: Record<string, number>;
  customized: boolean;
}

/** ปริมาณเหล็กที่ต้องการรับ (กก.) แยกตามเกรด */
export type DemandKgByGrade = Record<string, number>;

/** วันที่ (YYYY-MM-DD) → โรงงาน → เกรด → กก. */
export type DailyDemand = Record<string, Record<string, DemandKgByGrade>>;
