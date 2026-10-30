"use client";

import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import {
  getSlotCapacities,
  type SlotCapacityConfig,
} from "@/app/data/slot-capacity";
import { formatHour, formatSlot, slotHours } from "@/app/data/slot-time";
import type { BookingStatus, PlanRow, QueueBooking } from "@/app/types/queue";

/** ขั้นตอนใน pipeline ที่ใช้แสดงในแถบกิจกรรม (ไม่แยกตามเกรด) */
const pipelineStages: {
  key: string;
  label: string;
  statuses: BookingStatus[];
  bar: string;
  soft: string;
  text: string;
}[] = [
  {
    key: "pre-checkin",
    label: "1. ยังไม่ check-in",
    statuses: ["confirmed", "waiting"],
    bar: "bg-sky-400",
    soft: "bg-sky-50",
    text: "text-sky-800",
  },
  {
    key: "queueing",
    label: "3. รอจัดคิว",
    statuses: ["checked-in"],
    bar: "bg-amber-400",
    soft: "bg-amber-50",
    text: "text-amber-800",
  },
  {
    key: "waiting-call",
    label: "4. รอเรียก",
    statuses: ["at-gate"],
    bar: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-800",
  },
  {
    key: "calling",
    label: "5. Operation แจ้ง รปภ. แล้ว",
    statuses: ["call-requested"],
    bar: "bg-violet-500",
    soft: "bg-violet-50",
    text: "text-violet-800",
  },
  {
    key: "called",
    label: "6.1 รปภ. โทรเรียกแล้ว",
    statuses: ["called"],
    bar: "bg-rose-400",
    soft: "bg-rose-50",
    text: "text-rose-800",
  },
  {
    key: "no-answer",
    label: "6.2 รปภ. โทรแล้วไม่รับ",
    statuses: ["no-answer"],
    bar: "bg-rose-500",
    soft: "bg-rose-50",
    text: "text-rose-800",
  },
];

/**
 * แถบกิจกรรมตามช่วงเวลา (pipeline) — แสดงจำนวนรถในแต่ละขั้นตอนต่อ slot
 * เพื่อให้ ปศ. เห็นว่าต้องเรียกคันไหนมาต่อ และเทียบกับ cap ที่ตั้งไว้ในแผน
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
  const maxTotal = Math.max(
    1,
    ...slotHours.map((hour) => {
      const capacities = getSlotCapacities(
        capacityConfig,
        plans,
        bookDate,
        "SYS1",
        formatSlot(hour),
        { ignoreClosure: true },
      );
      return Object.values(capacities).reduce((sum, value) => sum + value, 0);
    }),
  );

  return (
    <Panel className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-sys-900">กิจกรรมตามช่วงเวลา (pipeline)</h2>
          <p className="text-xs text-slate-400">
            จำนวนรถในแต่ละขั้นตอนของแต่ละ slot เทียบกับจำนวนที่รับได้ในแผนรับเหล็ก · สีแดง = เกิน cap
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {pipelineStages.map((stage) => (
            <span key={stage.key} className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`h-3 w-3 rounded ${stage.bar}`} />
              {stage.label}
            </span>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100 border-y border-slate-100">
        {slotHours.map((hour) => {
          const slot = formatSlot(hour);
          const capacities = getSlotCapacities(
            capacityConfig,
            plans,
            bookDate,
            "SYS1",
            slot,
            { ignoreClosure: true },
          );
          const totalCap = Object.values(capacities).reduce((sum, value) => sum + value, 0);
          const inSlot = bookings.filter(
            (booking) => booking.date === date && booking.timeSlot === slot,
          );
          const inPipeline = inSlot.filter((booking) => booking.status !== "completed");
          const overCap = inPipeline.length > totalCap;
          const fillPercent =
            totalCap > 0 ? Math.min(100, (inPipeline.length / totalCap) * 100) : 0;
          const stageCounts = pipelineStages
            .map((stage) => ({
              stage,
              count: inPipeline.filter((booking) => stage.statuses.includes(booking.status))
                .length,
            }))
            .filter((item) => item.count > 0);
          const nextToCall = inPipeline.filter(
            (booking) => booking.status === "at-gate",
          ).length;
          const isEmpty = inPipeline.length === 0;
          return (
            <div
              key={hour}
              className="grid grid-cols-[3.5rem_1fr] gap-3 py-2 sm:grid-cols-[4.5rem_1fr]"
            >
              <span className="pt-2 text-right text-xs font-medium text-slate-400">
                {formatHour(hour)}
              </span>
              <div
                className={`flex min-h-11 w-full flex-col gap-1.5 rounded-xl border p-2 ${
                  overCap ? "border-rose-200 bg-rose-50/40" : "border-slate-100 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        overCap ? "font-bold text-rose-600" : "font-semibold text-sys-800"
                      }
                    >
                      {inPipeline.length} / {totalCap} คัน
                    </span>
                    {overCap && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        เกิน cap
                      </span>
                    )}
                    {nextToCall > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        <Icon name="phone" size={10} />
                        ต้องเรียกต่อ {nextToCall} คัน
                      </span>
                    )}
                  </span>
                  {isEmpty && <span className="text-[10px] text-slate-300">ว่าง</span>}
                </div>

                {/* แถบ fill เทียบ cap */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${overCap ? "bg-rose-500" : "bg-sys-500"}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                {/* ขั้นตอนของรถใน slot นี้ */}
                {!isEmpty && (
                  <div className="flex flex-wrap gap-1.5">
                    {stageCounts.map(({ stage, count }) => (
                      <span
                        key={stage.key}
                        title={`${stage.label}: ${count} คัน`}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-bold ${stage.soft} ${stage.text}`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-sm ${stage.bar}`} />
                        {stage.label}
                        <span className="rounded bg-white/70 px-1">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        จำนวนรถ = ใบนำส่งที่ยังไม่จบ (ไม่รวมที่ผ่านป้อมแล้ว) · cap = จำนวนรับสูงสุดตามแผน ·
        แถบสีแสดงขั้นตอนปัจจุบันของรถใน slot นั้น
      </p>
    </Panel>
  );
}
