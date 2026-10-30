import type {
  BookingReceipt,
  Plant,
  PlanRow,
  QueueBooking,
} from "../types/queue.ts";
import type {
  BreakdownBy,
  BreakdownRow,
  BreakdownValues,
  PlanFillRow,
  PlantSummaryRow,
} from "../types/overview.ts";

type ReceiptMap = Record<string, BookingReceipt>;

export function formatKg(value: number): string {
  return `${Math.round(value).toLocaleString("th-TH")} กก.`;
}

export function getGroupValue(booking: QueueBooking, group: BreakdownBy): string {
  if (group === "grade") return booking.grade;
  if (group === "seller") return booking.broker === "—" ? "ไม่ระบุผู้ขาย" : booking.broker;
  return booking.retailer;
}

const bookedKgOf = (booking: QueueBooking): number => booking.estimatedTons * 1000;

function sum(bookings: QueueBooking[], toKg: (booking: QueueBooking) => number): number {
  return bookings.reduce((total, booking) => total + toKg(booking), 0);
}

export interface OverviewMetrics {
  visibleBookings: QueueBooking[];
  scheduledBookings: QueueBooking[];
  receivedOnDate: QueueBooking[];
  noShowBookings: QueueBooking[];
  lateBookings: QueueBooking[];
  bookedKg: number;
  receivedKg: number;
  noShowKg: number;
  lateKg: number;
  plantSummary: PlantSummaryRow[];
}

export function computeOverviewMetrics(
  bookings: QueueBooking[],
  receipts: ReceiptMap,
  plants: Plant[],
  date: string,
  plantFilter: string,
): OverviewMetrics {
  // ระบบไม่รู้ "ยอดรับจริง" — ใช้สถานะใบนำส่งที่เกิดขึ้นจริงแทน
  // (ผ่านป้อมแล้ว = ส่งแล้ว, ยกเลิก = ยกเลิก, ยังไม่ผ่านป้อม = ยังไม่มาส่ง)
  const visibleBookings = bookings
    .filter((booking) => booking.date === date)
    .filter((booking) => plantFilter === "all" || booking.plantId === plantFilter);
  const scheduledBookings = visibleBookings;
  const receivedOnDate = visibleBookings.filter(
    (booking) => booking.status === "completed",
  );
  const noShowBookings = visibleBookings.filter(
    (booking) => booking.status === "cancelled",
  );
  const lateBookings: QueueBooking[] = [];

  const plantSummary = plants
    .filter((plant) => plantFilter === "all" || plant.id === plantFilter)
    .map((plant) => {
      const inPlant = (booking: QueueBooking): boolean => booking.plantId === plant.id;
      return {
        ...plant,
        bookedKg: sum(scheduledBookings.filter(inPlant), bookedKgOf),
        receivedKg: sum(receivedOnDate.filter(inPlant), bookedKgOf),
        noShowKg: sum(noShowBookings.filter(inPlant), bookedKgOf),
        lateKg: 0,
      };
    });

  return {
    visibleBookings,
    scheduledBookings,
    receivedOnDate,
    noShowBookings,
    lateBookings,
    bookedKg: sum(scheduledBookings, bookedKgOf),
    receivedKg: sum(receivedOnDate, bookedKgOf),
    noShowKg: sum(noShowBookings, bookedKgOf),
    lateKg: 0,
    plantSummary,
  };
}

export function computeBreakdownRows(
  visibleBookings: QueueBooking[],
  receipts: ReceiptMap,
  date: string,
  breakdownBy: BreakdownBy,
): BreakdownRow[] {
  const groups = new Map<string, BreakdownValues>();
  for (const booking of visibleBookings) {
    const group = getGroupValue(booking, breakdownBy);
    const row = groups.get(group) ?? { booked: 0, received: 0, noShow: 0, late: 0 };
    const receipt = receipts[booking.id];
    if (booking.date === date) {
      row.booked += bookedKgOf(booking);
      if (receipt?.state === "no-show") row.noShow += bookedKgOf(booking);
      if (receipt?.state === "received" && receipt.receivedDate === date) {
        row.received += receipt.receivedKg;
      }
    } else if (receipt?.state === "received" && receipt.receivedDate === date) {
      row.late += receipt.receivedKg;
    }
    groups.set(group, row);
  }
  const total = (row: BreakdownValues): number =>
    row.booked + row.received + row.noShow + row.late;
  return [...groups.entries()].sort((left, right) => total(right[1]) - total(left[1]));
}

export function computePlanRows(
  plans: PlanRow[],
  scheduledBookings: QueueBooking[],
  plantFilter: string,
): PlanFillRow[] {
  return plans
    .filter((plan) => ["Bundle SY", "Local O"].includes(plan.grade))
    .filter((plan) => plantFilter === "all" || plan.plantId === plantFilter)
    .map((plan) => {
      const reservedKg = sum(
        scheduledBookings.filter(
          (booking) => booking.plantId === plan.plantId && booking.grade === plan.grade,
        ),
        bookedKgOf,
      );
      return {
        ...plan,
        reservedKg,
        fillPercent:
          plan.dailyLimit > 0
            ? Math.min(100, (reservedKg / (plan.dailyLimit * 1000)) * 100)
            : 0,
      };
    });
}
