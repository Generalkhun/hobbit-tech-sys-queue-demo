import type { PlanRow, QueueBooking } from "@/app/types/queue";

export interface PendingWorkRow {
  date: string;
  grade: string;
  bookedKg: number;
  targetKg: number;
  fillPercent: number;
}

/**
 * คำนวณปริมาณงานคงค้างในอีก 7 วันข้างหน้า
 * เปรียบเทียบยอดจองกับเป้าหมาย แยกตามเกรด
 */
export function computePendingWork(
  bookings: QueueBooking[],
  plans: PlanRow[],
  fromDate: string,
  days: number = 7,
): PendingWorkRow[] {
  const rows: PendingWorkRow[] = [];
  const start = new Date(fromDate);

  for (let i = 0; i < days; i++) {
    const current = new Date(start);
    current.setDate(current.getDate() + i);
    const dateStr = current.toISOString().slice(0, 10);

    for (const plan of plans) {
      const targetKg = plan.dailyLimit * 1000;
      const bookedKg = bookings
        .filter(
          (b) =>
            b.date === dateStr &&
            b.plantId === plan.plantId &&
            b.grade === plan.grade,
        )
        .reduce((sum, b) => sum + b.estimatedTons * 1000, 0);

      rows.push({
        date: dateStr,
        grade: plan.grade,
        bookedKg,
        targetKg,
        fillPercent: targetKg > 0 ? Math.min(100, (bookedKg / targetKg) * 100) : 0,
      });
    }
  }

  return rows;
}

/**
 * รวมยอดคงค้างตามเกรด ไม่แยกวัน
 */
export function computePendingWorkByGrade(
  bookings: QueueBooking[],
  plans: PlanRow[],
  fromDate: string,
  days: number = 7,
): { grade: string; totalBookedKg: number; totalTargetKg: number; fillPercent: number }[] {
  const rows = computePendingWork(bookings, plans, fromDate, days);
  const byGrade = new Map<string, { bookedKg: number; targetKg: number }>();

  for (const row of rows) {
    const current = byGrade.get(row.grade) ?? { bookedKg: 0, targetKg: 0 };
    current.bookedKg += row.bookedKg;
    current.targetKg += row.targetKg;
    byGrade.set(row.grade, current);
  }

  return [...byGrade.entries()].map(([grade, totals]) => ({
    grade,
    totalBookedKg: totals.bookedKg,
    totalTargetKg: totals.targetKg,
    fillPercent: totals.targetKg > 0 ? Math.min(100, (totals.bookedKg / totals.targetKg) * 100) : 0,
  }));
}