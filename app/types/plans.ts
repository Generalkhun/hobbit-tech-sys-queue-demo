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
