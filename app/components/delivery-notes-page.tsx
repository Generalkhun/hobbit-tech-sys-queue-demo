"use client";

import { useMemo, useState } from "react";
import { demoDate } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Panel, StatusBadge } from "@/app/components/ui";
import type { QueueBooking } from "@/app/types/queue";

export function DeliveryNotesPage({
  bookings,
  onCreateBooking,
}: {
  bookings: QueueBooking[];
  onCreateBooking: () => void;
}) {
  const [query, setQuery] = useState("");
  const [plantFilter, setPlantFilter] = useState("all");
  const todayBookings = bookings.filter((booking) => booking.date === demoDate);
  const filtered = useMemo(
    () =>
      todayBookings.filter((booking) => {
        const matchesPlant =
          plantFilter === "all" || booking.plantId === plantFilter;
        const matchesText =
          `${booking.id} ${booking.retailer} ${booking.broker} ${booking.plate}`
            .toLowerCase()
            .includes(query.toLowerCase());
        return matchesPlant && matchesText;
      }),
    [todayBookings, plantFilter, query],
  );

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
            <Icon name="document" size={19} />
          </div>
          <div>
            <h2 className="font-bold text-sys-900">ใบนำส่งเศษเหล็ก</h2>
            <p className="mt-1 text-xs text-slate-400">
              รายการจองและสถานะใบนำส่งตามวันที่เลือก
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateBooking}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-sys-600 px-4 text-xs font-semibold text-white hover:bg-sys-700"
        >
          <Icon name="plus" size={16} />
          สร้างใบนำส่ง
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <span className="text-xs text-slate-500">
          อังคาร 27 ตุลาคม 2569 · {filtered.length} รายการ
        </span>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Icon
              name="search"
              size={15}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="h-10 w-52 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="เลขที่ ร้านค้า ทะเบียนรถ"
              aria-label="ค้นหาใบนำส่ง"
            />
          </div>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600"
            value={plantFilter}
            onChange={(event) => setPlantFilter(event.target.value)}
            aria-label="กรองโรงงาน"
          >
            <option value="all">ทุกโรงงาน</option>
            <option value="SYS1">SYS 1</option>
            <option value="SYS2">SYS 2</option>
          </select>
        </div>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-6 py-3.5">เลขที่ใบนำส่ง</th>
              <th className="px-4 py-3.5">ร้านค้า / ผู้ขาย</th>
              <th className="px-4 py-3.5">โรงงาน / เกรด</th>
              <th className="px-4 py-3.5">วันและเวลาจอง</th>
              <th className="px-4 py-3.5">รถ / ผู้ขับ</th>
              <th className="px-4 py-3.5">ปริมาณ</th>
              <th className="px-6 py-3.5">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4 font-bold text-sys-700">
                  {booking.id}
                  <p className="mt-1 font-normal text-[10px] text-slate-400">
                    QR พร้อมใช้งาน
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-700">
                    {booking.retailer}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {booking.broker}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-700">
                    {booking.plantId}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {booking.grade}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-600">{booking.date}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {booking.timeSlot} น.
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-700">{booking.plate}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {booking.driver}
                  </p>
                </td>
                <td className="px-4 py-4 font-medium text-slate-600">
                  {booking.estimatedTons} ตัน
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">
            ไม่พบใบนำส่งที่ตรงกับคำค้นหา
          </p>
        )}
      </div>
    </Panel>
  );
}
