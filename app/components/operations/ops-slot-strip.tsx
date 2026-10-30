"use client";

import {
  getGradeColor,
} from "@/app/data/grade-colors";
import {
  getSlotCapacities,
  type SlotCapacityConfig,
} from "@/app/data/slot-capacity";
import { formatHour, formatSlot, slotHours } from "@/app/data/slot-time";
import { Panel } from "@/app/components/ui";
import type { PlanRow, QueueBooking } from "@/app/types/queue";

/**
 * แถบแสดง activity ต่อ timeslot (reuse แนวคิดจากแผนรับเหล็ก):
 * - โชว์จำนวนรถใน pipeline ของแต่ละ slot เทียบกับ cap ที่กำหนดไว้
 * - ถ้าเกิน cap ขึ้นสีแดง (แต่ไม่ block การทำงาน)
 */
export function OpsSlotStrip({
  date,
  bookDate,
  plans,
  bookings,
  capacityConfig,
}: {
  /** วันที่ดู */
  date: string;
  /** วันที่ของแผน (bookings date) */
  bookDate: string;
  plans: PlanRow[];
  bookings: QueueBooking[];
  capacityConfig: SlotCapacityConfig;
}) {
  const grades = Array.from(new Set(plans.map((plan) => plan.grade)));
  const maxTotal = Math.max(
    1,
    ...slotHours.map((hour) => {
      const capacities = getSlotCapacities(capacityConfig, plans, bookDate, "SYS1", formatSlot(hour), { ignoreClosure: true });
      return Object.values(capacities).reduce((sum, value) => sum + value, 0);
    }),
  );

  return (
    <Panel className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-sys-900">กิจกรรมตามช่วงเวลา (pipeline)</h2>
          <p className="text-xs text-slate-400">
            จำนวนรถที่อยู่ในคิวของแต่ละ slot เทียบกับจำนวนที่รับได้ในแผนรับเหล็ก · สีแดง = เกิน cap
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {grades.map((grade) => (
            <span key={grade} className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`h-3 w-3 rounded ${getGradeColor(grades, grade).bar}`} />
              {grade}
            </span>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100 border-y border-slate-100">
        {slotHours.map((hour) => {
          const slot = formatSlot(hour);
          const capacities = getSlotCapacities(capacityConfig, plans, bookDate, "SYS1", slot, { ignoreClosure: true });
          const totalCap = Object.values(capacities).reduce((sum, value) => sum + value, 0);
          const inSlot = bookings.filter((booking) => booking.date === date && booking.timeSlot === slot);
          const inPipeline = inSlot.filter((booking) => booking.status !== "completed");
          const byGrade = new Map<string, number>();
          inPipeline.forEach((booking) => {
            byGrade.set(booking.grade, (byGrade.get(booking.grade) ?? 0) + 1);
          });
          const overCap = inPipeline.length > totalCap;
          const widthPercent = maxTotal > 0 ? (inPipeline.length / maxTotal) * 100 : 0;
          return (
            <div key={hour} className="grid grid-cols-[3.5rem_1fr] gap-3 py-2 sm:grid-cols-[4.5rem_1fr]">
              <span className="pt-2 text-right text-xs font-medium text-slate-400">
                {formatHour(hour)}
              </span>
              <div className="flex min-h-10 w-full flex-col gap-1 rounded-xl border border-slate-100 bg-white p-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className={overCap ? "font-bold text-rose-600" : "font-semibold text-sys-800"}>
                    {inPipeline.length} / {totalCap} คัน
                  </span>
                  {overCap && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      เกิน cap
                    </span>
                  )}
                  {inPipeline.length === 0 && (
                    <span className="text-[10px] text-slate-300">ว่าง</span>
                  )}
                </div>
                <div className="flex items-stretch gap-1" style={{ width: `${Math.max(15, widthPercent)}%` }}>
                  {grades.map((grade) => {
                    const color = getGradeColor(grades, grade);
                    const count = byGrade.get(grade) ?? 0;
                    if (count === 0) return null;
                    return (
                      <div key={grade} title={`${grade}: ${count} คัน`} className={`flex min-w-0 flex-1 items-center gap-1 overflow-hidden rounded ${color.soft} px-1.5 py-0.5`}>
                        <span className={`h-3 w-1 shrink-0 rounded ${color.bar}`} />
                        <span className={`truncate text-[10px] font-bold ${color.text}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        จำนวนรถ = ใบนำส่งที่ยังไม่จบ (ไม่รวมที่ผ่านป้อมแล้ว) · cap = จำนวนรับสูงสุดตามแผน
      </p>
    </Panel>
  );
}
