"use client";

import { useMemo, useState } from "react";
import { demoDate, plants } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Button, Panel, StatusBadge } from "@/app/components/ui";
import type { DriverRecord, VehicleRecord } from "@/app/types/registry";
import type { BookingStatus, QueueBooking } from "@/app/types/queue";

/** แถวรถที่ต้องโทรเรียก พร้อมข้อมูลผู้ขับและรถ */
interface CallRow {
  booking: QueueBooking;
  driver?: DriverRecord;
  vehicle?: VehicleRecord;
}

export function SecurityPage({
  bookings,
  drivers,
  vehicles,
  onRecordCheckin,
  onStatusChange,
  onMarkNoAnswer,
}: {
  bookings: QueueBooking[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  onRecordCheckin: (
    id: string,
    atTime: string,
  ) => { error?: string; lateMinutes: number };
  onStatusChange: (id: string, status: BookingStatus) => string | null;
  /** รปภ. กดบันทึกว่าโทรแล้วไม่รับ — รถยังอยู่ที่เดิม ติดสถานะโทรแล้วไม่รับ */
  onMarkNoAnswer: (id: string) => { error?: string; count: number };
}) {
  const [scanId, setScanId] = useState("");
  const [plantId, setPlantId] = useState(plants[0].id);
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState<"success" | "error">("success");

  const todayBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.date === demoDate && booking.plantId === plantId,
      ),
    [bookings, plantId],
  );

  function enrich(booking: QueueBooking): CallRow {
    // ชื่อผู้ขับในใบนำส่งอาจไม่มีคำนำหน้า ("นาย") — เทียบแบบตัดคำนำหน้าออก
    const normalize = (name: string) =>
      name.replace(/^(นาย|นาง|นางสาว|น\.ส\.)\s*/, "").trim();
    const target = normalize(booking.driver);
    return {
      booking,
      driver: drivers.find(
        (driver) =>
          normalize(driver.name) === target &&
          driver.plate === booking.plate &&
          driver.carrier === booking.carrier,
      ),
      vehicle: vehicles.find((vehicle) => vehicle.plate === booking.plate),
    };
  }

  /** ตารางบน: รถที่ ปศ. แจ้งให้ รปภ. โทรเรียก (สถานะ 5) + ที่โทรแล้วไม่รับ (6.2) */
  const toCall: CallRow[] = useMemo(
    () =>
      todayBookings
        .filter(
          (booking) =>
            booking.status === "call-requested" || booking.status === "no-answer",
        )
        .map(enrich),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayBookings, drivers, vehicles],
  );

  /** ตารางล่าง: รถที่โทรเรียกแล้ว กำลังมาเข้าโรงงาน (สถานะ 6.1) */
  const incoming: CallRow[] = useMemo(
    () =>
      todayBookings
        .filter((booking) => booking.status === "called")
        .map(enrich),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayBookings, drivers, vehicles],
  );

  const waitingCheckin = todayBookings.filter(
    (booking) => booking.status === "waiting" || booking.status === "confirmed",
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
      setNotice("ใบนำส่งนี้ออกใบนำผ่านและผ่านป้อมแล้ว");
      return;
    }
    if (
      booking.status === "checked-in" ||
      booking.status === "at-gate" ||
      booking.status === "call-requested" ||
      booking.status === "called" ||
      booking.status === "no-answer"
    ) {
      setNoticeKind("success");
      setNotice(`รถทะเบียน ${booking.plate} ได้รับคิวและอยู่ระหว่างรอเรียกแล้ว`);
      return;
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    const checkin = onRecordCheckin(booking.id, timeStr);
    if (checkin.error) {
      setNoticeKind("error");
      setNotice(checkin.error);
      return;
    }
    const lateText =
      checkin.lateMinutes >= 10 ? ` · เช็คอินสาย ${checkin.lateMinutes} นาที` : "";
    setNoticeKind("success");
    setNotice(`ตรวจสอบสำเร็จ · รถทะเบียน ${booking.plate} เช็คอินที่ป้อมแล้ว${lateText}`);
    setScanId("");
  }

  function callDriver(row: CallRow) {
    const error = onStatusChange(row.booking.id, "called");
    setNoticeKind(error ? "error" : "success");
    setNotice(error ?? `โทรเรียกรถทะเบียน ${row.booking.plate} แล้ว · รถกำลังมา`);
  }

  function markNoAnswer(row: CallRow) {
    const result = onMarkNoAnswer(row.booking.id);
    setNoticeKind(result.error ? "error" : "success");
    setNotice(
      result.error ??
        `บันทึกโทรไม่รับ · รถทะเบียน ${row.booking.plate} (ครั้งที่ ${result.count}) — รอ ปศ. สั่งให้โทรอีก`,
    );
  }

  function passGate(row: CallRow) {
    const error = onStatusChange(row.booking.id, "completed");
    setNoticeKind(error ? "error" : "success");
    setNotice(
      error ?? `ออกใบนำผ่าน · รถทะเบียน ${row.booking.plate} ผ่านป้อมแล้ว`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "ต้องโทรเรียก",
            value: String(toCall.length),
            icon: "phone" as const,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "โทรแล้ว · กำลังมา",
            value: String(incoming.length),
            icon: "truck" as const,
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

      {/* สแกนเช็คอินที่ป้อม */}
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="scan" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">สแกนใบนำส่ง · เช็คอินที่ป้อม</h2>
              <p className="mt-1 text-xs text-slate-400">
                สแกนใบนำส่งเพื่อให้รถเช็คอินและเข้าสู่คิวรอจัดคิว
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
              ตรวจสอบและบันทึกเช็คอิน
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
                "สแกนใบนำส่ง ให้รถเช็คอินและเข้าคิว",
                "รอ ปศ. แจ้งรายการที่ต้องโทรเรียก",
                "โทรเรียกคนขับ — ถ้าไม่รับ กดบันทึกไว้ รอ ปศ. สั่งให้โทรอีก",
                "ออกใบนำผ่านเมื่อรถผ่านป้อมเข้าโรงงาน",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-xs leading-5 text-slate-600">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-sys-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 text-[11px] text-slate-500">
              รอรถเช็คอินที่ป้อม {waitingCheckin.length} คัน
            </p>
          </div>
        </div>
      </Panel>

      {/* ตารางบน: ต้องโทรเรียก */}
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Icon name="phone" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">รถที่ต้องโทรเรียก</h2>
              <p className="mt-1 text-xs text-slate-400">
                รายการที่ ปศ. แจ้งให้โทรเรียก · กดโทรเรียกแล้วรถจะย้ายไปตาราง "กำลังมา"
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {toCall.length} คัน
          </span>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">รูปถ่ายรถ</th>
                <th className="px-4 py-3">ใบนำส่ง</th>
                <th className="px-4 py-3">ผู้ขับ</th>
                <th className="px-4 py-3">เบอร์ติดต่อ</th>
                <th className="px-4 py-3">ทะเบียนรถ</th>
                <th className="px-4 py-3">เวลาจอง</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {toCall.map((row) => (
                <tr key={row.booking.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <VehicleThumb vehicle={row.vehicle} plate={row.booking.plate} />
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-sys-700">
                    {row.booking.id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {row.booking.driver}
                  </td>
                  <td className="px-4 py-3.5">
                    {row.driver?.phone ? (
                      <a
                        href={`tel:${row.driver.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-sys-700 hover:text-sys-900"
                      >
                        <Icon name="phone" size={12} />
                        {row.driver.phone}
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{row.booking.plate}</td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {row.booking.timeSlot} น.
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.booking.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {row.booking.status === "no-answer" ? (
                      <span className="text-[11px] text-rose-600">
                        รอ ปศ. สั่งให้โทรอีก
                      </span>
                    ) : (
                      <div className="flex flex-col items-end gap-1.5">
                        <Button
                          className="px-3 py-2 text-[11px]"
                          onClick={() => callDriver(row)}
                        >
                          <Icon name="phone" size={12} />
                          โทรเรียกแล้ว
                        </Button>
                        <Button
                          variant="secondary"
                          className="px-3 py-2 text-[11px]"
                          onClick={() => markNoAnswer(row)}
                        >
                          <Icon name="close" size={12} />
                          โทรแล้วไม่รับ
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {toCall.length === 0 && (
            <p className="py-10 text-center text-xs text-slate-400">
              ยังไม่มีรถที่ต้องโทรเรียก — รอ ปศ. แจ้งรายการ
            </p>
          )}
        </div>
      </Panel>

      {/* ตารางล่าง: กำลังมา */}
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Icon name="truck" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">รถกำลังมาเข้าโรงงาน</h2>
              <p className="mt-1 text-xs text-slate-400">
                โทรเรียกแล้ว · รอรถผ่านป้อมเพื่อออกใบนำผ่าน
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {incoming.length} คัน
          </span>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">รูปถ่ายรถ</th>
                <th className="px-4 py-3">ใบนำส่ง</th>
                <th className="px-4 py-3">ผู้ขับ</th>
                <th className="px-4 py-3">เบอร์ติดต่อ</th>
                <th className="px-4 py-3">ทะเบียนรถ</th>
                <th className="px-4 py-3">เวลาจอง</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incoming.map((row) => (
                <tr key={row.booking.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <VehicleThumb vehicle={row.vehicle} plate={row.booking.plate} />
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-sys-700">
                    {row.booking.id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {row.booking.driver}
                  </td>
                  <td className="px-4 py-3.5">
                    {row.driver?.phone ? (
                      <a
                        href={`tel:${row.driver.phone}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-sys-700 hover:text-sys-900"
                      >
                        <Icon name="phone" size={12} />
                        {row.driver.phone}
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{row.booking.plate}</td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {row.booking.timeSlot} น.
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.booking.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="success"
                      className="px-3 py-2 text-[11px]"
                      onClick={() => passGate(row)}
                    >
                      <Icon name="check" size={12} />
                      ออกใบนำผ่าน
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {incoming.length === 0 && (
            <p className="py-10 text-center text-xs text-slate-400">
              ยังไม่มีรถที่โทรเรียกแล้ว
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}

/** รูปถ่ายรถขนาดย่อ พร้อม fallback เมื่อไม่มีรูป */
function VehicleThumb({
  vehicle,
  plate,
}: {
  vehicle?: VehicleRecord;
  plate: string;
}) {
  const photo =
    vehicle?.photos.front ??
    vehicle?.photos.back ??
    vehicle?.photos.right ??
    vehicle?.photos.left;
  if (!photo) {
    return (
      <div className="grid h-12 w-16 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
        <Icon name="truck" size={18} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={`รูปถ่ายรถทะเบียน ${plate}`}
      className="h-12 w-16 rounded-lg border border-slate-200 object-cover"
    />
  );
}
