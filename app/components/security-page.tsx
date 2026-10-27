"use client";

import { useMemo, useState } from "react";
import { demoDate, plants } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Button, Panel, StatusBadge } from "@/app/components/ui";
import type { BookingStatus, QueueBooking } from "@/app/types/queue";

export function SecurityPage({
  bookings,
  onStatusChange,
}: {
  bookings: QueueBooking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const [scanId, setScanId] = useState("");
  const [plantId, setPlantId] = useState(plants[0].id);
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState<"success" | "error">("success");
  const arriving = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.date === demoDate &&
          booking.plantId === plantId &&
          booking.status !== "completed",
      ),
    [bookings, plantId],
  );

  function scanPass() {
    const booking = bookings.find(
      (item) => item.id.toLowerCase() === scanId.trim().toLowerCase(),
    );
    if (!booking) {
      setNoticeKind("error");
      setNotice("ไม่พบใบนำส่ง กรุณาตรวจสอบเลขที่ใบนำส่งอีกครั้ง");
      return;
    }
    if (booking.date !== demoDate || booking.plantId !== plantId) {
      setNoticeKind("error");
      setNotice("ใบนำส่งนี้ไม่ตรงกับวันที่หรือโรงงานที่เลือก");
      return;
    }
    if (booking.status === "completed") {
      setNoticeKind("error");
      setNotice("ใบนำส่งนี้บันทึกเข้าโรงงานแล้ว");
      return;
    }
    if (booking.status === "at-gate" || booking.status === "called") {
      setNoticeKind("success");
      setNotice(`รถทะเบียน ${booking.plate} ยืนยันผ่านสถานี รปภ. แล้ว`);
      return;
    }
    onStatusChange(booking.id, "at-gate");
    setNoticeKind("success");
    setNotice(`ตรวจสอบสำเร็จ · รถทะเบียน ${booking.plate} เข้าสู่คิวโรงงานแล้ว`);
    setScanId("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "รอตรวจใบนำส่ง",
            value: String(
              arriving.filter(
                (booking) =>
                  booking.status === "waiting" || booking.status === "confirmed",
              ).length,
            ),
            icon: "document" as const,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "ยืนยันผ่านป้อมแล้ว",
            value: String(
              arriving.filter(
                (booking) =>
                  booking.status === "at-gate" || booking.status === "called",
              ).length,
            ),
            icon: "shield" as const,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "โรงงานที่ประจำ",
            value: plantId.replace("SYS", "SYS "),
            icon: "warehouse" as const,
            color: "bg-sys-50 text-sys-700",
          },
        ].map((stat) => (
          <Panel key={stat.label} className="flex items-center gap-4 p-5">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${stat.color}`}>
              <Icon name={stat.icon} size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-sys-900">{stat.value}</p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="scan" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">สถานีแรก · ตรวจรถเข้าโดย รปภ.</h2>
              <p className="mt-1 text-xs text-slate-400">
                ตรวจเลขที่ใบนำส่ง/QR ก่อนยืนยันให้รถเข้าสู่พื้นที่โรงงาน
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              โรงงานประจำ
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                value={plantId}
                onChange={(event) => setPlantId(event.target.value)}
              >
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name} · {plant.location}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
              เลขที่ใบนำส่ง / QR payload
              <input
                className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                placeholder="เช่น SC26100719"
                value={scanId}
                onChange={(event) => setScanId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") scanPass();
                }}
              />
            </label>
            <Button className="mt-4 w-full sm:w-auto" onClick={scanPass}>
              <Icon name="qr" size={16} />
              ตรวจสอบและบันทึกรถผ่านป้อม
            </Button>
            {notice && (
              <p
                role="status"
                className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                  noticeKind === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {notice}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-sys-100 bg-sys-50/50 p-5">
            <div className="flex items-center gap-2 font-semibold text-sys-800">
              <Icon name="shield" size={18} />
              ขั้นตอนของสถานี รปภ.
            </div>
            <ol className="mt-4 space-y-3">
              {[
                "ตรวจโรงงานและวันที่ตามใบนำส่ง",
                "ตรวจทะเบียนรถและชื่อผู้ขับ",
                "บันทึกเวลารถผ่านป้อม",
                "ส่งคิวต่อให้ทีมปฏิบัติการเศษเหล็กเรียกรถ",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-xs leading-5 text-slate-600">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-sys-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-sys-900">
                รายการรถที่โรงงาน {plantId.replace("SYS", "SYS ")}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                เฉพาะคิวตามวันที่จอง
              </p>
            </div>
            <span className="rounded-full bg-sys-50 px-3 py-1 text-xs font-semibold text-sys-700">
              {arriving.length} คัน
            </span>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">ใบนำส่ง</th>
                  <th className="px-4 py-3">ผู้ขาย / ร้านค้า</th>
                  <th className="px-4 py-3">ผู้ขับ / ทะเบียน</th>
                  <th className="px-4 py-3">เวลาจอง</th>
                  <th className="px-4 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {arriving.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3.5 font-semibold text-sys-700">
                      {booking.id}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {booking.retailer}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700">{booking.driver}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{booking.plate}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {booking.timeSlot} น.
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {arriving.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                ยังไม่มีรถจองเข้าวันนี้
              </p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
