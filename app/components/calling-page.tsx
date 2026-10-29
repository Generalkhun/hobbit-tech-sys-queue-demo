"use client";

import { useMemo, useState } from "react";
import { demoDate } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Button, Panel, StatusBadge } from "@/app/components/ui";
import type {
  BookingStatus,
  PlanRow,
  QueueBooking,
} from "@/app/types/queue";

export function CallingPage({
  bookings,
  plans,
  onStatusChange,
  onMoveBooking,
}: {
  bookings: QueueBooking[];
  plans: PlanRow[];
  onStatusChange: (id: string, status: BookingStatus) => string | null;
  onMoveBooking: (bookingId: string, targetPlantId: string) => string | null;
}) {
  const [query, setQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const [moveNotice, setMoveNotice] = useState("");
  const [moveNoticeError, setMoveNoticeError] = useState(false);
  const active = bookings.filter(
    (booking) => booking.date === demoDate && booking.status !== "completed",
  );
  const filtered = useMemo(
    () =>
      active
        .filter(
          (booking) =>
            plantFilter === "all" || booking.plantId === plantFilter,
        )
        .filter((booking) =>
          `${booking.id} ${booking.retailer} ${booking.driver} ${booking.plate}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const order: Record<BookingStatus, number> = {
            "at-gate": 0,
            "call-requested": 1,
            called: 2,
            waiting: 3,
            confirmed: 4,
            completed: 5,
          };
          return order[a.status] - order[b.status];
        }),
    [active, plantFilter, query],
  );
  const atGateCount = active.filter((item) => item.status === "at-gate").length;
  const callRequestedCount = active.filter(
    (item) => item.status === "call-requested",
  ).length;
  const calledCount = active.filter((item) => item.status === "called").length;
  const waitingCount = active.filter(
    (item) => item.status === "waiting" || item.status === "confirmed",
  ).length;

  function advanceQueue(booking: QueueBooking) {
    if (booking.status === "at-gate") {
      const error = onStatusChange(booking.id, "call-requested");
      setMoveNoticeError(Boolean(error));
      setMoveNotice(error ?? `แจ้ง รปภ. ให้โทรเรียกรถ ${booking.plate} แล้ว`);
    }
  }

  const stats = [
    { label: "รับคิวแล้ว · รถออกไปรอ ปศ.", value: atGateCount, icon: "shield" as const },
    { label: "แจ้ง รปภ. ให้โทรเรียก", value: callRequestedCount, icon: "phone" as const },
    { label: "รปภ. โทรเรียกแล้ว · รอใบนำผ่าน", value: calledCount, icon: "clock" as const },
    { label: "รอตรวจเข้าที่สถานี รปภ.", value: waitingCount, icon: "clock" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Panel key={stat.label} className="flex items-center gap-4 p-5">
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl ${
                index === 0
                  ? "bg-sky-50 text-sky-600"
                  : index === 1
                    ? "bg-violet-50 text-violet-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              <Icon name={stat.icon} size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-sys-900">
                {stat.value} คัน
              </p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="truck" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">
                จัดการการจัดส่ง · ปฏิบัติการเศษเหล็ก
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                แจ้ง รปภ. ให้โทรเรียกหลังรถได้รับคิวและออกไปรอแล้ว
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Icon
                name="search"
                size={15}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                className="h-10 w-48 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
                placeholder="ค้นหาเลขที่ / ร้านค้า"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
              value={plantFilter}
              onChange={(event) => setPlantFilter(event.target.value)}
              aria-label="กรองตามโรงงาน"
            >
              <option value="all">ทุกโรงงาน</option>
              <option value="SYS1">SYS 1</option>
              <option value="SYS2">SYS 2</option>
            </select>
          </div>
        </div>

        {moveNotice && (
          <p
            role={moveNoticeError ? "alert" : "status"}
            className={`mx-5 mt-4 rounded-lg px-4 py-3 text-xs sm:mx-6 ${
              moveNoticeError
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {moveNotice}
          </p>
        )}

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3.5">ใบนำส่ง</th>
                <th className="px-4 py-3.5">เวลา</th>
                <th className="px-4 py-3.5">ร้านค้า / เกรด</th>
                <th className="px-4 py-3.5">โรงงาน</th>
                <th className="px-4 py-3.5">ผู้ขับ / ทะเบียน</th>
                <th className="px-4 py-3.5">ปริมาณ</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-6 py-3.5 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-bold text-sys-700">
                    {booking.id}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-600">
                    {booking.timeSlot} น.
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-700">
                      {booking.retailer}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {booking.grade}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      {booking.plantId}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-700">{booking.driver}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {booking.plate} · {booking.carrier}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-600">
                    {booking.estimatedTons} ตัน
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {booking.status === "at-gate" && (
                      <Button
                        onClick={() => advanceQueue(booking)}
                        className="px-3 py-2 text-xs"
                      >
                        <Icon name="phone" size={14} />
                        แจ้ง รปภ. ให้โทรเรียก
                      </Button>
                    )}
                    {booking.status === "call-requested" && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                        รปภ. กำลังโทรเรียก
                      </span>
                    )}
                    {booking.status === "called" && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-[11px] text-violet-700">
                        รอรถผ่านป้อมพร้อมใบนำผ่าน
                      </span>
                    )}
                    {(booking.status === "waiting" ||
                      booking.status === "confirmed") && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-400">
                        <Icon name="clock" size={13} />
                        รอ รปภ. ตรวจรถ
                      </span>
                    )}
                    {booking.status !== "completed" &&
                      plans.some(
                        (plan) =>
                          plan.grade === booking.grade &&
                          plan.plantId !== booking.plantId,
                      ) && (
                        <button
                          type="button"
                          className="mt-2 block w-full text-right text-[11px] font-semibold text-sys-700 hover:text-sys-900"
                          onClick={() => {
                            const destination = plans.find(
                              (plan) =>
                                plan.grade === booking.grade &&
                                plan.plantId !== booking.plantId,
                            )?.plantId;
                            if (!destination) return;
                            const error = onMoveBooking(booking.id, destination);
                            setMoveNoticeError(Boolean(error));
                            setMoveNotice(
                              error ??
                                `${booking.id} โยกจาก ${booking.plantId} ไป ${destination} แล้ว`,
                            );
                          }}
                        >
                          โยกไป{" "}
                          {booking.plantId === "SYS1" ? "SYS 2" : "SYS 1"}
                        </button>
                      )}
                    {booking.schedulingReason && (
                      <p className="mt-2 max-w-[190px] text-right text-[10px] leading-4 text-slate-400">
                        {booking.schedulingReason}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-14 text-center text-sm text-slate-400">
              ไม่พบรายการที่ตรงกับตัวกรอง
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400 sm:px-6">
          <span>แสดง {filtered.length} รายการสำหรับทีม ปศ.</span>
          <span className="flex items-center gap-1.5">
            <Icon name="refresh" size={13} />
            อัปเดตอัตโนมัติ
          </span>
        </div>
      </Panel>
    </div>
  );
}
