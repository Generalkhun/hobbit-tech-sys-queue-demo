import type { DailyDemand, DemandKgByGrade } from "@/app/types/plans";

export const DEMAND_STEP_KG = 100;
/** วันที่ไม่เกินวันนี้ + จำนวนวันนี้ แก้ไขไม่ได้ */
export const LOCKED_AHEAD_DAYS = 7;

export const weekdayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export interface CalendarCell {
  date: string;
  day: number;
  inMonth: boolean;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return toIsoDate(result.getUTCFullYear(), result.getUTCMonth(), result.getUTCDate());
}

/** วันที่ที่เกินวันนี้ไปไม่เกิน 7 วัน หรืออยู่ในอดีต จะแก้ไขไม่ได้ */
export function isDateLocked(date: string, today: string) {
  return date <= addDays(today, LOCKED_AHEAD_DAYS);
}

export function shiftMonth(year: number, month: number, delta: number) {
  const index = year * 12 + month + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

/** ตารางปฏิทินทั้งเดือน เริ่มต้นวันอาทิตย์ เต็มสัปดาห์ */
export function getMonthCells(year: number, month: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = first.getUTCDay();
  const total = Math.ceil((leading + daysInMonth) / 7) * 7;
  return Array.from({ length: total }, (_, index) => {
    const date = addDays(toIsoDate(year, month, 1), index - leading);
    return {
      date,
      day: Number(date.slice(8)),
      inMonth: Number(date.slice(5, 7)) === month + 1,
    };
  });
}

export function adjustKg(value: number, delta: number) {
  return Math.max(0, value + delta);
}

export function sumDemand(byGrade: DemandKgByGrade | undefined) {
  return Object.values(byGrade ?? {}).reduce((sum, kg) => sum + kg, 0);
}

export function sumDayDemand(demand: DailyDemand, date: string) {
  return sumDemand(demand[date]);
}

export function setDayDemand(
  demand: DailyDemand,
  date: string,
  byGrade: DemandKgByGrade,
): DailyDemand {
  return { ...demand, [date]: byGrade };
}
