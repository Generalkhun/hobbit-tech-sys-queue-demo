import type { Plant, PlanRow } from "./queue";

export type BreakdownBy = "grade" | "seller" | "retailer";

export interface PlantSummaryRow extends Plant {
  bookedKg: number;
  receivedKg: number;
  noShowKg: number;
  lateKg: number;
}

export interface BreakdownValues {
  booked: number;
  received: number;
  noShow: number;
  late: number;
}

export type BreakdownRow = [string, BreakdownValues];

export interface PlanFillRow extends PlanRow {
  reservedKg: number;
  fillPercent: number;
}
