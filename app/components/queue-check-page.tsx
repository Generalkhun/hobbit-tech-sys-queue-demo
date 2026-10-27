"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/components/icons";
import { Panel, StatusBadge } from "@/app/components/ui";
import type { QueueBooking } from "@/app/types/queue";

export function QueueCheckPage({ bookings }: { bookings: QueueBooking[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const matches = useMemo(
    () =>
      query.trim()
        ? bookings.filter((booking) =>
            `${booking.id} ${booking.plate} ${booking.driver} ${booking.retailer}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
        : [],
    [bookings, query],
  );
  const selected =
    bookings.find((booking) => booking.id === selectedId) ??
    (matches.length === 1 ? matches[0] : undefined);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="search" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">ตรวจสอบคิวและใบนำส่ง</h2>
              <p className="mt-1 text-xs text-slate-400">
                ค้นหาด้วยเลขใบนำส่ง ทะเบียนรถ ชื่อผู้ขับ หรือร้านค้า
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            คำค้นหา
            <div className="relative">
              <Icon
                name="search"
                size={17}
                className="absolute left-4 top-3.5 text-slate-400"
              />
              <input
                className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedId("");
                }}
                placeholder="เช่น SC26100719 หรือ 70-4380"
                autoFocus
              />
            </div>
          </label>

          {matches.length > 1 && !selected && (
            <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {matches.map((booking) => (
                <button
                  type="button"
                  key={booking.id}
                  onClick={() => setSelectedId(booking.id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <span>
                    <span className="block text-sm font-semibold text-sys-700">
                      {booking.id}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {booking.plate} · {booking.driver} · {booking.plantId}
                    </span>
                  </span>
                  <StatusBadge status={booking.status} />
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-5 rounded-2xl border border-sys-100 bg-sys-50/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">ใบนำส่ง</p>
                  <h3 className="mt-1 text-lg font-bold text-sys-800">
                    {selected.id}
                  </h3>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <div className="mt-4 grid gap-4 border-t border-sys-100 pt-4 sm:grid-cols-2">
                {[
                  ["ร้านค้า", selected.retailer],
                  ["โรงงาน", selected.plantId],
                  ["วันที่ / เวลา", `${selected.date} · ${selected.timeSlot}`],
                  ["เกรด / ปริมาณ", `${selected.grade} · ${selected.estimatedTons} ตัน`],
                  ["พนักงานขับ", selected.driver],
                  ["บริษัทขนส่ง / ทะเบียน", `${selected.carrier} · ${selected.plate}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && matches.length === 0 && (
            <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              ไม่พบข้อมูลคิวที่ตรงกับคำค้นหา
            </p>
          )}
        </div>
      </Panel>
      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 text-xs leading-5 text-slate-500">
        <Icon name="shield" size={17} className="mt-0.5 shrink-0 text-sys-600" />
        หน้านี้ใช้ตรวจสอบข้อมูลคิวเท่านั้น การยืนยันรถเข้าพื้นที่ทำที่สถานี
        รปภ. และการเรียกรถเข้าโรงงานดำเนินการโดยทีม ปศ.
      </div>
    </div>
  );
}
