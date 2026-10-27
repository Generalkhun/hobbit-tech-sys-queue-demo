import { plants } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Panel, StatusBadge } from "@/app/components/ui";
import type { PageKey, QueueBooking } from "@/app/types/queue";

const slots = [
  { time: "07:00", one: 3, two: 2 },
  { time: "08:00", one: 7, two: 5 },
  { time: "09:00", one: 8, two: 4 },
  { time: "10:00", one: 5, two: 6 },
  { time: "11:00", one: 6, two: 3 },
  { time: "12:00", one: 3, two: 2 },
  { time: "13:00", one: 7, two: 4 },
  { time: "14:00", one: 5, two: 5 },
  { time: "15:00", one: 4, two: 3 },
  { time: "16:00", one: 2, two: 3 },
];

const gradeTint = [
  "bg-sys-500",
  "bg-teal-400",
  "bg-cyan-300",
  "bg-emerald-300",
  "bg-sky-400",
];

export function OverviewPage({
  bookings,
  onNavigate,
  canManagePlans,
  queuePage,
  queueActionLabel,
}: {
  bookings: QueueBooking[];
  onNavigate: (page: PageKey) => void;
  canManagePlans: boolean;
  queuePage: PageKey;
  queueActionLabel: string;
}) {
  const active = bookings.filter((booking) => booking.status !== "completed");
  const waiting = bookings.filter(
    (booking) => booking.status === "waiting" || booking.status === "confirmed",
  );
  const called = bookings.filter((booking) => booking.status === "called");

  const stats = [
    {
      label: "คิวที่จองวันนี้",
      value: "24",
      detail: "จาก 36 คิวทั้งหมด",
      icon: "calendar" as const,
      className: "bg-sys-50 text-sys-700",
      trend: "+12%",
    },
    {
      label: "รถรอเรียก",
      value: String(waiting.length + 3),
      detail: "ทั้ง 2 โรงงาน",
      icon: "clock" as const,
      className: "bg-amber-50 text-amber-600",
      trend: "คิวถัดไป 09:00",
    },
    {
      label: "เรียกรถแล้ว",
      value: String(called.length + 2),
      detail: "กำลังเดินทางเข้าโรงงาน",
      icon: "phone" as const,
      className: "bg-violet-50 text-violet-600",
      trend: "เฉลี่ย 18 นาที",
    },
    {
      label: "รับเข้าโรงงานแล้ว",
      value: String(5 + bookings.filter((item) => item.status === "completed").length),
      detail: "ตั้งแต่เริ่มกะวันนี้",
      icon: "circle-check" as const,
      className: "bg-emerald-50 text-emerald-600",
      trend: "+3 คัน",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-3 text-[32px] leading-none font-bold tracking-tight text-sys-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl ${stat.className}`}
              >
                <Icon name={stat.icon} size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">{stat.detail}</span>
              <span className="text-[11px] font-semibold text-sys-600">
                {stat.trend}
              </span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
            <div>
              <h2 className="font-bold text-sys-900">ปริมาณจองคิววันนี้</h2>
              <p className="mt-1 text-xs text-slate-400">
                จำนวนรถที่จองแยกตามช่วงเวลา
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sys-500" />
                SYS 1
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sys-200" />
                SYS 2
              </span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-6 sm:px-6">
            <div className="flex h-[208px] items-end justify-between gap-1 border-b border-slate-100 pb-7 sm:gap-3">
              {slots.map((slot) => (
                <div
                  key={slot.time}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-[170px] w-full max-w-[34px] items-end gap-[3px]">
                    <div
                      className="w-1/2 rounded-t-md bg-sys-500 transition-all"
                      style={{ height: `${slot.one * 10}%` }}
                    />
                    <div
                      className="w-1/2 rounded-t-md bg-sys-200 transition-all"
                      style={{ height: `${slot.two * 10}%` }}
                    />
                  </div>
                  <span className="absolute mt-[198px] text-[10px] text-slate-400">
                    {slot.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {plants.map((plant) => {
                const percent = Math.round(
                  (plant.reservedTons / plant.dailyCapacity) * 100,
                );
                return (
                  <div
                    key={plant.id}
                    className="rounded-xl bg-slate-50 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {plant.name}
                      </span>
                      <span className="text-xs font-semibold text-sys-700">
                        {percent}% capacity
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-sys-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {plant.reservedTons} / {plant.dailyCapacity} ตัน
                      <span className="mx-1.5">·</span>
                      {plant.activeQueues} คิว
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-sys-900">สัดส่วนเกรดเหล็ก</h2>
              <p className="mt-1 text-xs text-slate-400">
                ปริมาณจองรวม 468 ตัน
              </p>
            </div>
            {canManagePlans && (
              <button
                type="button"
                onClick={() => onNavigate("plans")}
                className="text-xs font-semibold text-sys-600 hover:text-sys-800"
              >
                ดูแผน
              </button>
            )}
          </div>
          <div className="mt-6 flex h-3 overflow-hidden rounded-full">
            {[36, 27, 18, 12, 7].map((share, index) => (
              <span
                key={share}
                className={`${gradeTint[index]} h-full`}
                style={{ width: `${share}%` }}
              />
            ))}
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["Bundle SY", "168 ตัน", "36%"],
              ["Local O", "126 ตัน", "27%"],
              ["Scrap Return SP", "84 ตัน", "18%"],
              ["PM Scrap L1", "56 ตัน", "12%"],
              ["อื่น ๆ", "34 ตัน", "7%"],
            ].map((row, index) => (
              <div
                key={row[0]}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2.5 text-slate-600">
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${gradeTint[index]}`}
                  />
                  {row[0]}
                </span>
                <span className="font-medium text-slate-500">
                  {row[1]}
                  <span className="ml-3 inline-block w-8 text-right text-slate-400">
                    {row[2]}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-sys-100 bg-sys-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sys-800">
              <Icon name="sparkle" size={16} />
              วางแผนได้อีก 14 คิววันนี้
            </div>
            <p className="mt-1 pl-6 text-[11px] text-slate-500">
              SYS 2 ยังมีช่องรับช่วงบ่าย
            </p>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-sys-900">รายการใบนำส่งล่าสุด</h2>
            <p className="mt-1 text-xs text-slate-400">
              รถที่จองไว้สำหรับวันที่ 27 ตุลาคม 2569
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(queuePage)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sys-600 hover:text-sys-800"
          >
            {queueActionLabel} <Icon name="arrow" size={14} />
          </button>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3">เลขที่ใบนำส่ง</th>
                <th className="px-4 py-3">ร้านค้า / ผู้ขาย</th>
                <th className="px-4 py-3">โรงงาน</th>
                <th className="px-4 py-3">ช่วงเวลา</th>
                <th className="px-4 py-3">ปริมาณ</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3.5 font-semibold text-sys-700">
                    {booking.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-700">
                      {booking.retailer}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {booking.grade}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">
                    {booking.plantId}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {booking.timeSlot} น.
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">
                    {booking.estimatedTons} ตัน
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {active.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            ยังไม่มีคิวที่กำลังดำเนินการ
          </p>
        )}
      </Panel>
    </div>
  );
}
