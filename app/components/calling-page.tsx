"use client";

import { useMemo, useState } from "react";
import { demoDate } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Button, Panel, StatusBadge } from "@/app/components/ui";
import type { BookingStatus, QueueBooking } from "@/app/types/queue";

export function CallingPage({
  bookings,
  onStatusChange,
}: {
  bookings: QueueBooking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const [query, setQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
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
            called: 1,
            waiting: 2,
            confirmed: 3,
            completed: 4,
          };
          return order[a.status] - order[b.status];
        }),
    [active, plantFilter, query],
  );
  const atGateCount = active.filter((item) => item.status === "at-gate").length;
  const calledCount = active.filter((item) => item.status === "called").length;
  const waitingCount = active.filter(
    (item) => item.status === "waiting" || item.status === "confirmed",
  ).length;

  function advanceQueue(booking: QueueBooking) {
    if (booking.status === "at-gate") {
      onStatusChange(booking.id, "called");
    } else if (booking.status === "called") {
      onStatusChange(booking.id, "completed");
    }
  }

  const stats = [
    { label: "รถผ่านป้อม · รอทีมเรียก", value: atGateCount, icon: "shield" as const },
    { label: "ทีมเรียกรถแล้ว", value: calledCount, icon: "phone" as const },
    { label: "รอตรวจเข้าที่สถานี รปภ.", value: waitingCount, icon: "clock" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
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
                เรียกรถหลัง รปภ. ตรวจและบันทึกรถผ่านสถานีแรกแล้ว
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
                        เรียกรถเข้าโรงงาน
                      </Button>
                    )}
                    {booking.status === "called" && (
                      <Button
                        variant="success"
                        onClick={() => advanceQueue(booking)}
                        className="px-3 py-2 text-xs"
                      >
                        <Icon name="check" size={14} />
                        ยืนยันเสร็จสิ้น
                      </Button>
                    )}
                    {(booking.status === "waiting" ||
                      booking.status === "confirmed") && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-400">
                        <Icon name="clock" size={13} />
                        รอ รปภ. ตรวจรถ
                      </span>
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
          <span>แสดง {filtered.length} รายการสำหรับทีมปฏิบัติการ</span>
          <span className="flex items-center gap-1.5">
            <Icon name="refresh" size={13} />
            อัปเดตอัตโนมัติ
          </span>
        </div>
      </Panel>
    </div>
  );
}
