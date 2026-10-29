import { demoDate, plants } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Panel, StatusBadge } from "@/app/components/ui";
import type { PageKey, QueueBooking } from "@/app/types/queue";

const slotTimes = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
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
  const dailyBookings = bookings.filter((booking) => booking.date === demoDate);
  const active = dailyBookings.filter((booking) => booking.status !== "completed");
  const waiting = dailyBookings.filter(
    (booking) => booking.status === "waiting" || booking.status === "confirmed",
  );
  const called = dailyBookings.filter(
    (booking) =>
      booking.status === "call-requested" || booking.status === "called",
  );
  const passedGate = dailyBookings.filter(
    (booking) => booking.status === "completed",
  );
  const slotData = slotTimes.map((time) => ({
    time,
    one: dailyBookings.filter(
      (booking) => booking.plantId === "SYS1" && booking.timeSlot.startsWith(time),
    ).length,
    two: dailyBookings.filter(
      (booking) => booking.plantId === "SYS2" && booking.timeSlot.startsWith(time),
    ).length,
  }));
  const maximumSlotCount = Math.max(
    1,
    ...slotData.flatMap((slot) => [slot.one, slot.two]),
  );
  const gradeTotals = dailyBookings.reduce<Map<string, number>>(
    (totals, booking) => {
      totals.set(
        booking.grade,
        (totals.get(booking.grade) ?? 0) + booking.estimatedTons,
      );
      return totals;
    },
    new Map(),
  );
  const gradeRows = [...gradeTotals.entries()].sort(
    ([, left], [, right]) => right - left,
  );
  const totalBookedTons = dailyBookings.reduce(
    (total, booking) => total + booking.estimatedTons,
    0,
  );

  const stats = [
    {
      label: "รถที่จองวันนี้",
      value: String(dailyBookings.length),
      detail: `${totalBookedTons} ตันตามปริมาณประมาณการ`,
      icon: "calendar" as const,
      className: "bg-sys-50 text-sys-700",
      trend: "อัปเดตจากรายการ",
    },
    {
      label: "รถรอเรียก",
      value: String(waiting.length + dailyBookings.filter((item) => item.status === "at-gate").length),
      detail: "รอตรวจและรอจัดคิว",
      icon: "clock" as const,
      className: "bg-amber-50 text-amber-600",
      trend: "รอ รปภ. สแกน",
    },
    {
      label: "รอ รปภ. โทรเรียก",
      value: String(called.length),
      detail: "ปศ. แจ้งเรียกรถหรือ รปภ. โทรแล้ว",
      icon: "phone" as const,
      className: "bg-violet-50 text-violet-600",
      trend: "ดูสถานะตามคิว",
    },
    {
      label: "ผ่านป้อม รปภ. แล้ว",
      value: String(passedGate.length),
      detail: "จบ flow ของระบบคิว",
      icon: "circle-check" as const,
      className: "bg-emerald-50 text-emerald-600",
      trend: "ใบนำผ่านแล้ว",
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
              {slotData.map((slot) => (
                <div
                  key={slot.time}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-[170px] w-full max-w-[34px] items-end gap-[3px]">
                    <div
                      className="w-1/2 rounded-t-md bg-sys-500 transition-all"
                      style={{
                        height: `${(slot.one / maximumSlotCount) * 100}%`,
                      }}
                    />
                    <div
                      className="w-1/2 rounded-t-md bg-sys-200 transition-all"
                      style={{
                        height: `${(slot.two / maximumSlotCount) * 100}%`,
                      }}
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
                const plantBookings = dailyBookings.filter(
                  (booking) => booking.plantId === plant.id,
                );
                const reservedTons = plantBookings.reduce(
                  (total, booking) => total + booking.estimatedTons,
                  0,
                );
                const percent =
                  plant.dailyCapacity === 0
                    ? 0
                    : Math.min(
                        100,
                        Math.round((reservedTons / plant.dailyCapacity) * 100),
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
                      {reservedTons} / {plant.dailyCapacity} ตันตามประมาณการ
                      <span className="mx-1.5">·</span>
                      {plantBookings.length} คิว
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
                ปริมาณจองรวม {totalBookedTons} ตัน
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
            {gradeRows.map(([grade, tons], index) => (
              <span
                key={grade}
                className={`${gradeTint[index]} h-full`}
                style={{
                  width: `${
                    totalBookedTons === 0 ? 0 : (tons / totalBookedTons) * 100
                  }%`,
                }}
              />
            ))}
          </div>
          <div className="mt-5 space-y-4">
            {gradeRows.map(([grade, tons], index) => (
              <div
                key={grade}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2.5 text-slate-600">
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${gradeTint[index]}`}
                  />
                  {grade}
                </span>
                <span className="font-medium text-slate-500">
                  {tons} ตัน
                  <span className="ml-3 inline-block w-8 text-right text-slate-400">
                    {totalBookedTons === 0
                      ? "0%"
                      : `${Math.round((tons / totalBookedTons) * 100)}%`}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-sys-100 bg-sys-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sys-800">
              <Icon name="sparkle" size={16} />
              ตัวเลขคำนวณจากใบนำส่งใน demo
            </div>
            <p className="mt-1 pl-6 text-[11px] text-slate-500">
              ปริมาณเป็นค่าประมาณ ไม่ใช่น้ำหนักชั่งเข้า/ออก
            </p>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-sys-900">รายการใบนำส่งล่าสุด</h2>
            <p className="mt-1 text-xs text-slate-400">
              รถที่จองไว้สำหรับวันที่ {new Date(`${demoDate}T00:00:00`).toLocaleDateString("th-TH")}
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
              {dailyBookings.slice(0, 5).map((booking) => (
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
