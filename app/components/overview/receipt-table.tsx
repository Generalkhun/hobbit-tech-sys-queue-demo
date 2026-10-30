import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import type { CheckinTimes, QueueBooking } from "@/app/types/queue";

/** ผลลัพธ์ที่เกิดขึ้นจริงของใบนำส่ง (แสดงอย่างเดียว ไม่ต้องบันทึก) */
type Outcome = "pending" | "delivered" | "late" | "no-show" | "cancelled";

const outcomeStyle: Record<
  Outcome,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "ยังไม่มาส่ง",
    className: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
  delivered: {
    label: "ส่งแล้ว",
    className: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  late: {
    label: "ส่งแล้ว (สาย)",
    className: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  "no-show": {
    label: "ไม่มาตามนัด",
    className: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  cancelled: {
    label: "ยกเลิก",
    className: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

/** คำนวณความสายจากเวลาเช็คอินเทียบเวลานัด (เกิน 10 นาที = สาย) */
function lateMinutesOf(timeSlot: string, checkinTime: string) {
  const [slotHour] = timeSlot.split(":").map(Number);
  const [hour, minute] = checkinTime.split(":").map(Number);
  if (Number.isNaN(slotHour) || Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return Math.max(0, hour * 60 + minute - slotHour * 60);
}

function outcomeOf(
  booking: QueueBooking,
  checkinTimes: CheckinTimes,
): { outcome: Outcome; lateMinutes: number } {
  if (booking.status === "cancelled") return { outcome: "cancelled", lateMinutes: 0 };
  if (booking.status === "completed") {
    const checkinTime = checkinTimes[booking.id];
    const lateMinutes = checkinTime ? lateMinutesOf(booking.timeSlot, checkinTime) : 0;
    return {
      outcome: lateMinutes >= 10 ? "late" : "delivered",
      lateMinutes,
    };
  }
  return { outcome: "pending", lateMinutes: 0 };
}

export function ReceiptTable({
  bookings,
  checkinTimes,
  date,
  queueActionLabel,
  onOpenQueue,
}: {
  bookings: QueueBooking[];
  checkinTimes: CheckinTimes;
  date: string;
  queueActionLabel: string;
  onOpenQueue: () => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sys-900">
              ผลการมาส่ง / การไม่มาตามนัด
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              สรุปสิ่งที่เกิดขึ้นจริงของแต่ละใบนำส่งในวันที่เลือก
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQueue}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sys-700"
          >
            {queueActionLabel} <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-500">
            <tr>
              <th className="px-6 py-3">ใบนำส่ง</th>
              <th className="px-4 py-3">โรงงาน / เกรด</th>
              <th className="px-4 py-3">ผู้ขาย / ร้านค้า</th>
              <th className="px-4 py-3">เวลานัดหมาย</th>
              <th className="px-4 py-3">เวลา Check-in</th>
              <th className="px-6 py-3">ผลการมาส่ง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const { outcome, lateMinutes } = outcomeOf(booking, checkinTimes);
              const style = outcomeStyle[outcome];
              const checkinTime = checkinTimes[booking.id];
              return (
                <tr key={booking.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3.5 font-semibold text-sys-700">
                    {booking.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-700">{booking.plantId}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{booking.grade}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-700">{booking.broker}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {booking.retailer}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {booking.date} · {booking.timeSlot}
                  </td>
                  <td className="px-4 py-3.5">
                    {checkinTime ? (
                      <span className="rounded bg-cyan-600 px-2 py-1 text-[10px] font-bold text-white">
                        {checkinTime} น.
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                      {outcome === "late" && lateMinutes > 0 && ` ${lateMinutes} นาที`}
                    </span>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  ไม่มีใบนำส่งในวันที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
