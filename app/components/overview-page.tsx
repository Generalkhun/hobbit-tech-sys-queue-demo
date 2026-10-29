"use client";

import { useState } from "react";
import { demoDate, plants } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import type {
  BookingReceipt,
  PageKey,
  PlanRow,
  QueueBooking,
} from "@/app/types/queue";

type BreakdownBy = "grade" | "seller" | "retailer";

function formatKg(value: number) {
  return `${Math.round(value).toLocaleString("th-TH")} กก.`;
}

function getGroupValue(booking: QueueBooking, group: BreakdownBy) {
  if (group === "grade") return booking.grade;
  if (group === "seller") return booking.broker === "—" ? "ไม่ระบุผู้ขาย" : booking.broker;
  return booking.retailer;
}

export function OverviewPage({
  bookings,
  plans,
  receipts,
  onReceiptChange,
  onNavigate,
  canManagePlans,
  queuePage,
  queueActionLabel,
}: {
  bookings: QueueBooking[];
  plans: PlanRow[];
  receipts: Record<string, BookingReceipt>;
  onReceiptChange: (bookingId: string, receipt: BookingReceipt) => void;
  onNavigate: (page: PageKey) => void;
  canManagePlans: boolean;
  queuePage: PageKey;
  queueActionLabel: string;
}) {
  const [date, setDate] = useState(demoDate);
  const [plantFilter, setPlantFilter] = useState("all");
  const [breakdownBy, setBreakdownBy] = useState<BreakdownBy>("grade");

  const relevantBookings = bookings.filter(
    (booking) =>
      booking.date === date || receipts[booking.id]?.receivedDate === date,
  );
  const visibleBookings = relevantBookings.filter(
    (booking) => plantFilter === "all" || booking.plantId === plantFilter,
  );
  const scheduledBookings = visibleBookings.filter(
    (booking) => booking.date === date,
  );
  const bookedKg = scheduledBookings.reduce(
    (total, booking) => total + booking.estimatedTons * 1000,
    0,
  );
  const receivedOnDate = visibleBookings.filter(
    (booking) =>
      receipts[booking.id]?.state === "received" &&
      receipts[booking.id]?.receivedDate === date &&
      booking.date === date,
  );
  const receivedKg = receivedOnDate.reduce(
    (total, booking) => total + (receipts[booking.id]?.receivedKg ?? 0),
    0,
  );
  const noShowBookings = scheduledBookings.filter(
    (booking) => receipts[booking.id]?.state === "no-show",
  );
  const noShowKg = noShowBookings.reduce(
    (total, booking) => total + booking.estimatedTons * 1000,
    0,
  );
  const lateBookings = visibleBookings.filter(
    (booking) =>
      booking.date !== date &&
      receipts[booking.id]?.state === "received" &&
      receipts[booking.id]?.receivedDate === date,
  );
  const lateKg = lateBookings.reduce(
    (total, booking) => total + (receipts[booking.id]?.receivedKg ?? 0),
    0,
  );

  const plantSummary = plants
    .filter((plant) => plantFilter === "all" || plant.id === plantFilter)
    .map((plant) => {
      const scheduled = scheduledBookings.filter(
        (booking) => booking.plantId === plant.id,
      );
      const arrived = receivedOnDate.filter(
        (booking) => booking.plantId === plant.id,
      );
      const absent = noShowBookings.filter(
        (booking) => booking.plantId === plant.id,
      );
      const late = lateBookings.filter(
        (booking) => booking.plantId === plant.id,
      );
      return {
        ...plant,
        bookedKg: scheduled.reduce(
          (total, booking) => total + booking.estimatedTons * 1000,
          0,
        ),
        receivedKg: arrived.reduce(
          (total, booking) => total + (receipts[booking.id]?.receivedKg ?? 0),
          0,
        ),
        noShowKg: absent.reduce(
          (total, booking) => total + booking.estimatedTons * 1000,
          0,
        ),
        lateKg: late.reduce(
          (total, booking) => total + (receipts[booking.id]?.receivedKg ?? 0),
          0,
        ),
      };
    });

  const breakdownRows = (() => {
    const groups = new Map<
      string,
      { booked: number; received: number; noShow: number; late: number }
    >();
    for (const booking of visibleBookings) {
      const group = getGroupValue(booking, breakdownBy);
      const row = groups.get(group) ?? {
        booked: 0,
        received: 0,
        noShow: 0,
        late: 0,
      };
      const receipt = receipts[booking.id];
      if (booking.date === date) {
        row.booked += booking.estimatedTons * 1000;
        if (receipt?.state === "no-show") {
          row.noShow += booking.estimatedTons * 1000;
        }
        if (receipt?.state === "received" && receipt.receivedDate === date) {
          row.received += receipt.receivedKg;
        }
      } else if (
        receipt?.state === "received" &&
        receipt.receivedDate === date
      ) {
        row.late += receipt.receivedKg;
      }
      groups.set(group, row);
    }
    return [...groups.entries()].sort(
      (left, right) =>
        right[1].booked +
        right[1].received +
        right[1].noShow +
        right[1].late -
        (left[1].booked +
          left[1].received +
          left[1].noShow +
          left[1].late),
    );
  })();

  const activePlans = plans.filter((plan) =>
    ["Bundle SY", "Local O"].includes(plan.grade),
  );
  const planRows = activePlans
    .filter((plan) => plantFilter === "all" || plan.plantId === plantFilter)
    .map((plan) => {
      const reservedKg = scheduledBookings
        .filter(
          (booking) =>
            booking.plantId === plan.plantId && booking.grade === plan.grade,
        )
        .reduce((total, booking) => total + booking.estimatedTons * 1000, 0);
      return {
        ...plan,
        reservedKg,
        fillPercent:
          plan.dailyLimit > 0
            ? Math.min(100, (reservedKg / (plan.dailyLimit * 1000)) * 100)
            : 0,
      };
    });

  const stats = [
    {
      label: "ปริมาณจอง",
      value: formatKg(bookedKg),
      icon: "calendar" as const,
      color: "bg-sys-50 text-sys-700",
      description: `${scheduledBookings.length} ใบ · ตามวันที่จอง`,
    },
    {
      label: "เข้าจริงตรงวันจอง",
      value: formatKg(receivedKg),
      icon: "circle-check" as const,
      color: "bg-emerald-50 text-emerald-700",
      description: `${receivedOnDate.length} ใบ · บันทึกยอดรับจริง`,
    },
    {
      label: "จองแล้วไม่มา",
      value: formatKg(noShowKg),
      icon: "clock" as const,
      color: "bg-amber-50 text-amber-700",
      description: `${noShowBookings.length} ใบ · ระบุโดยผู้ใช้งาน`,
    },
    {
      label: "มาไม่ตรงวันที่จอง",
      value: formatKg(lateKg),
      icon: "refresh" as const,
      color: "bg-violet-50 text-violet-700",
      description: `${lateBookings.length} ใบ · มาถึงวันที่เลือก`,
    },
  ];

  const breakdownLabels: Record<BreakdownBy, string> = {
    grade: "เกรด",
    seller: "ผู้ขาย",
    retailer: "ร้านค้า",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-sys-900">Monitor Dashboard</h2>
          <p className="mt-1 text-xs text-slate-500">
            เปรียบเทียบยอดจองกับยอดรับจริง และติดตามใบที่ไม่มาตามนัด/มาผิดวัน
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-500">
            วันที่
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 bg-transparent text-sm text-slate-700 outline-none"
              aria-label="เลือกวันที่ dashboard"
            />
          </label>
          <select
            value={plantFilter}
            onChange={(event) => setPlantFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700"
            aria-label="กรองโรงงาน dashboard"
          >
            <option value="all">ทุกโรงงาน</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-sys-900">
                  {stat.value}
                </p>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.color}`}>
                <Icon name={stat.icon} size={19} />
              </div>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
              {stat.description}
            </p>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h3 className="font-bold text-sys-900">ปริมาณจองเทียบกับยอดรับจริง</h3>
          <p className="mt-1 text-xs text-slate-400">
            แยกตามโรงงาน · วันที่รับจริงที่ต่างจากวันที่จองจะนับเป็นมาผิดวัน
          </p>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500">
              <tr>
                <th className="px-6 py-3.5">โรงงาน</th>
                <th className="px-4 py-3.5">จองในวันนี้</th>
                <th className="px-4 py-3.5">เข้าจริงตรงวัน</th>
                <th className="px-4 py-3.5">จองแล้วไม่มา</th>
                <th className="px-6 py-3.5">มาผิดวันในวันนี้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plantSummary.map((plant) => (
                <tr key={plant.id}>
                  <td className="px-6 py-4 font-semibold text-sys-800">
                    {plant.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatKg(plant.bookedKg)}</td>
                  <td className="px-4 py-4 text-emerald-700">{formatKg(plant.receivedKg)}</td>
                  <td className="px-4 py-4 text-amber-700">{formatKg(plant.noShowKg)}</td>
                  <td className="px-6 py-4 text-violet-700">{formatKg(plant.lateKg)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold">
                <td className="px-6 py-4 text-sys-900">รวม</td>
                <td className="px-4 py-4">{formatKg(bookedKg)}</td>
                <td className="px-4 py-4 text-emerald-700">{formatKg(receivedKg)}</td>
                <td className="px-4 py-4 text-amber-700">{formatKg(noShowKg)}</td>
                <td className="px-6 py-4 text-violet-700">{formatKg(lateKg)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h3 className="font-bold text-sys-900">รายละเอียดตามมิติ</h3>
            <p className="mt-1 text-xs text-slate-400">
              ปริมาณจอง, รับจริง, ไม่มาตามนัด และมาผิดวัน
            </p>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1">
            {(Object.keys(breakdownLabels) as BreakdownBy[]).map((group) => (
              <button
                type="button"
                key={group}
                onClick={() => setBreakdownBy(group)}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  breakdownBy === group
                    ? "bg-white text-sys-800 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {breakdownLabels[group]}
              </button>
            ))}
          </div>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500">
              <tr>
                <th className="px-6 py-3">รายการ</th>
                <th className="px-4 py-3">จอง</th>
                <th className="px-4 py-3">รับจริงตรงวัน</th>
                <th className="px-4 py-3">ไม่มา</th>
                <th className="px-6 py-3">มาผิดวัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdownRows.map(([label, row]) => (
                <tr key={label}>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{label}</td>
                  <td className="px-4 py-3.5">{formatKg(row.booked)}</td>
                  <td className="px-4 py-3.5 text-emerald-700">{formatKg(row.received)}</td>
                  <td className="px-4 py-3.5 text-amber-700">{formatKg(row.noShow)}</td>
                  <td className="px-6 py-3.5 text-violet-700">{formatKg(row.late)}</td>
                </tr>
              ))}
              {breakdownRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    ไม่มีข้อมูลในวันที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h3 className="font-bold text-sys-900">แผนรับเกรด Local / Bundle</h3>
            <p className="mt-1 text-xs text-slate-400">
              เปรียบเทียบยอดจองกับปริมาณแผน เพื่อดูว่าแผนเต็มหรือยัง
            </p>
          </div>
          {canManagePlans && (
            <button
              type="button"
              onClick={() => onNavigate("plans")}
              className="text-xs font-semibold text-sys-700 hover:text-sys-900"
            >
              จัดการแผนรับ
            </button>
          )}
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          {planRows.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-sys-900">
                    {plan.plantId.replace("SYS", "SYS ")} · {plan.grade}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    เปิดรับ {plan.dailyLimit.toLocaleString("th-TH")} ตัน ·
                    จองแล้ว {(plan.reservedKg / 1000).toLocaleString("th-TH")} ตัน
                  </p>
                </div>
                <span className="text-xs font-semibold text-sys-700">
                  {Math.round(plan.fillPercent)}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    plan.fillPercent >= 100 ? "bg-rose-500" : "bg-sys-500"
                  }`}
                  style={{ width: `${plan.fillPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {plan.fillPercent >= 100 ? "เต็มแล้ว" : "ยังมีปริมาณรับเหลือ"}
              </p>
            </div>
          ))}
          {planRows.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400 sm:col-span-2">
              ไม่พบแผน Local / Bundle สำหรับโรงงานนี้
            </p>
          )}
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sys-900">บันทึกยอดรับจริง / การไม่มาตามนัด</h3>
              <p className="mt-1 text-xs text-slate-400">
                เลือกสถานะและกรอกวันที่กับน้ำหนักที่รับจริง เพื่อให้ dashboard สรุปผลได้
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(queuePage)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sys-700"
            >
              {queueActionLabel} <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500">
              <tr>
                <th className="px-6 py-3">ใบนำส่ง</th>
                <th className="px-4 py-3">โรงงาน / เกรด</th>
                <th className="px-4 py-3">ผู้ขาย / ร้านค้า</th>
                <th className="px-4 py-3">วันที่จอง</th>
                <th className="px-4 py-3">บันทึกผล</th>
                <th className="px-4 py-3">วันที่รับจริง</th>
                <th className="px-6 py-3">รับจริง (กก.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleBookings.map((booking) => {
                const receipt = receipts[booking.id] ?? {
                  state: "pending" as const,
                  receivedDate: "",
                  receivedKg: 0,
                };
                return (
                  <tr key={booking.id}>
                    <td className="px-6 py-3.5 font-semibold text-sys-700">{booking.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700">{booking.plantId}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{booking.grade}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-700">{booking.broker}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{booking.retailer}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {booking.date} · {booking.timeSlot}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={receipt.state}
                        onChange={(event) => {
                          const state = event.target.value as BookingReceipt["state"];
                          onReceiptChange(booking.id, {
                            ...receipt,
                            state,
                            receivedDate:
                              state === "received"
                                ? receipt.receivedDate || booking.date
                                : "",
                            receivedKg: state === "received" ? receipt.receivedKg : 0,
                          });
                        }}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                        aria-label={`ผลการมาของ ${booking.id}`}
                      >
                        <option value="pending">ยังไม่ระบุ</option>
                        <option value="received">เข้ารับแล้ว</option>
                        <option value="no-show" disabled={booking.date !== date}>
                          ไม่มาตามนัด
                        </option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="date"
                        value={receipt.receivedDate || booking.date}
                        disabled={receipt.state !== "received"}
                        onChange={(event) =>
                          onReceiptChange(booking.id, {
                            ...receipt,
                            receivedDate: event.target.value,
                          })
                        }
                        className="h-9 rounded-lg border border-slate-200 px-2 text-xs disabled:bg-slate-50 disabled:text-slate-400"
                        aria-label={`วันที่รับจริง ${booking.id}`}
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={receipt.state === "received" ? receipt.receivedKg : ""}
                        disabled={receipt.state !== "received"}
                        onChange={(event) =>
                          onReceiptChange(booking.id, {
                            ...receipt,
                            receivedKg: Number(event.target.value),
                          })
                        }
                        className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-xs disabled:bg-slate-50"
                        aria-label={`น้ำหนักรับจริง ${booking.id}`}
                      />
                    </td>
                  </tr>
                );
              })}
              {visibleBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    ไม่มีใบนำส่งในวันที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
