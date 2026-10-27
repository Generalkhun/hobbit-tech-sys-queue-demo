"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { plants } from "@/app/data/mock-data";
import { Icon, type IconName } from "@/app/components/icons";
import {
  Button,
  FieldLabel,
  inputClassName,
  Panel,
  StatusBadge,
} from "@/app/components/ui";
import type {
  BookingStatus,
  DemoUser,
  DriverRecord,
  QueueBooking,
} from "@/app/types/queue";

type NewBooking = Omit<QueueBooking, "id" | "createdAt" | "status">;

const retailerNames = [
  "ร้านสมชายค้าเหล็ก",
  "ร้านเจริญทรัพย์",
  "ร้านรุ่งเรืองโลหะ",
  "ร้านทองดี รีไซเคิล",
];

const deliverySteps: {
  title: string;
  detail: string;
  icon: IconName;
}[] = [
  { title: "จองคิว", detail: "ระบุโรงงาน วันเวลา และปริมาณ", icon: "document" },
  { title: "รับใบนำส่ง", detail: "QR Code สำหรับยืนยันคิว", icon: "qr" },
  { title: "ยืนยันที่ป้อม", detail: "รปภ. สแกนและบันทึกรถเข้า", icon: "shield" },
  { title: "รอเรียกคิว", detail: "ทีมรับเหล็กเรียกรถเข้าโรงงาน", icon: "phone" },
];

function DeliveryQr({ value }: { value: string }) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
      color: { dark: "#173847", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (active) setImage(dataUrl);
      })
      .catch((qrError: unknown) => {
        if (active) {
          setError(
            qrError instanceof Error
              ? qrError.message
              : "ไม่สามารถสร้าง QR Code ได้",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (error) {
    return (
      <p className="max-w-[200px] text-center text-xs text-rose-600">{error}</p>
    );
  }
  if (!image) {
    return (
      <div className="grid h-[180px] w-[180px] place-items-center rounded-xl bg-slate-50 text-slate-400">
        <span className="animate-pulse text-xs">กำลังสร้าง QR Code…</span>
      </div>
    );
  }

  return (
    // The generated QR is an actual encoded delivery payload for a scanner.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      width={180}
      height={180}
      alt={`QR Code ใบนำส่ง ${value}`}
      className="h-[180px] w-[180px]"
    />
  );
}

function DeliverySlip({
  booking,
  onStatusChange,
}: {
  booking: QueueBooking;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const qrValue = [
    "SYS-QUEUE",
    booking.id,
    booking.plantId,
    booking.date,
    booking.plate,
  ].join("|");
  return (
    <Panel className="delivery-slip overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200 px-5 py-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black italic tracking-[-2px] text-sys-700">
              SYS
            </span>
            <span className="h-5 w-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-500">
              ระบบจัดการคิวรับเศษเหล็ก
            </span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-sys-900">ใบนำส่งเศษเหล็ก</h2>
          <p className="mt-1 text-xs text-slate-500">
            Delivery queue pass · กรุณาแสดง QR Code ที่ป้อม รปภ.
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
        <div className="grid content-start grid-cols-2 gap-x-5 gap-y-5">
          {[
            ["เลขที่ใบนำส่ง", booking.id],
            ["วันที่ส่ง", new Date(`${booking.date}T00:00:00`).toLocaleDateString("th-TH")],
            ["โรงงานปลายทาง", booking.plantId],
            ["ช่วงเวลาเข้ารับ", `${booking.timeSlot} น.`],
            ["ร้านค้าของเก่า", booking.retailer],
            ["ผู้ขาย / นายหน้า", booking.broker],
            ["เกรดเศษเหล็ก", booking.grade],
            ["ปริมาณโดยประมาณ", `${booking.estimatedTons} ตัน`],
            ["ชื่อผู้ขับ", booking.driver],
            ["บริษัทขนส่ง · ทะเบียนรถ", `${booking.carrier} · ${booking.plate}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-xl bg-sys-50/70 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sys-800">
              <Icon name="file" size={16} />
              ใบชั่งต้นทาง
            </div>
            <p className="mt-1.5 truncate pl-6 text-xs text-sys-700">
              {booking.ticketName}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <DeliveryQr value={qrValue} />
          <p className="mt-2 text-xs font-bold tracking-wide text-sys-800">
            SCAN TO CHECK IN
          </p>
          <p className="mt-1 text-[10px] text-slate-400">{booking.id}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
        <p className="max-w-lg text-[11px] leading-5 text-slate-500">
          ใบนำส่งใช้สำหรับยืนยันคิวและบันทึกรถเข้าโรงงานเท่านั้น
          ไม่ใช่เอกสารตรวจสอบคุณภาพเหล็ก
        </p>
        <div className="no-print flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => window.print()}
          >
            <Icon name="document" size={15} />
            พิมพ์ใบนำส่ง
          </Button>
          {booking.status !== "at-gate" && booking.status !== "completed" && (
            <Button
              variant="success"
              onClick={() => onStatusChange(booking.id, "at-gate")}
            >
              <Icon name="scan" size={15} />
              จำลองสแกนที่ป้อม รปภ.
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function BookingPage({
  user,
  drivers,
  bookings,
  onCreate,
  onStatusChange,
  onGoToRegistry,
}: {
  user: DemoUser;
  drivers: DriverRecord[];
  bookings: QueueBooking[];
  onCreate: (booking: NewBooking) => QueueBooking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onGoToRegistry: () => void;
}) {
  const ownShop = "ร้านสมชายค้าเหล็ก";
  const [retailer, setRetailer] = useState(
    user.role === "retailer" ? ownShop : retailerNames[0],
  );
  const [broker, setBroker] = useState(
    user.role === "broker" ? "บริษัท เอส.เอส. เมทัล" : "—",
  );
  const [plantId, setPlantId] = useState(plants[0].id);
  const [grade, setGrade] = useState("Bundle SY");
  const [date, setDate] = useState("2026-10-28");
  const [timeSlot, setTimeSlot] = useState("08:00–09:00");
  const [estimatedTons, setEstimatedTons] = useState("28");
  const approvedDrivers = drivers.filter((driver) => driver.approved);
  const [driverId, setDriverId] = useState(approvedDrivers[0]?.id ?? "");
  const [ticketName, setTicketName] = useState("ใบชั่งต้นทาง_ตัวอย่าง.pdf");
  const [createdBooking, setCreatedBooking] = useState<QueueBooking | null>(
    null,
  );
  const [formError, setFormError] = useState("");
  const selectedDriver =
    drivers.find((driver) => driver.id === driverId) ?? approvedDrivers[0];
  const recent = bookings.slice(0, 3);

  function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDriver?.approved) {
      setFormError("กรุณาเลือกผู้ขับที่ผ่านการอนุมัติแล้ว");
      return;
    }
    if (!ticketName) {
      setFormError("กรุณาแนบใบชั่งต้นทางก่อนสร้างใบนำส่ง");
      return;
    }
    const saved = onCreate({
      retailer,
      broker,
      plantId,
      grade,
      estimatedTons: Number(estimatedTons),
      date,
      timeSlot,
      driver: selectedDriver.name,
      carrier: selectedDriver.carrier,
      plate: selectedDriver.plate,
      ticketName,
    });
    setCreatedBooking(saved);
    setFormError("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <Panel className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
                <Icon name="document" size={19} />
              </div>
              <div>
                <h2 className="font-bold text-sys-900">ข้อมูลการจองคิว</h2>
                <p className="mt-1 text-xs text-slate-400">
                  กรอกข้อมูลรถและแนบใบชั่งต้นทางเพื่อออกใบนำส่ง
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={submitBooking} className="space-y-6 p-5 sm:p-7">
            <div>
              <p className="mb-3 text-xs font-bold text-slate-500">
                01 · ข้อมูลผู้ส่งและโรงงาน
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldLabel label="ร้านค้าของเก่า" required>
                  <select
                    className={inputClassName}
                    value={retailer}
                    onChange={(event) => setRetailer(event.target.value)}
                    disabled={user.role === "retailer"}
                    required
                  >
                    {retailerNames.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="ผู้ขายเศษเหล็ก / นายหน้า">
                  <select
                    className={inputClassName}
                    value={broker}
                    onChange={(event) => setBroker(event.target.value)}
                  >
                    <option>—</option>
                    <option>บริษัท เอส.เอส. เมทัล</option>
                    <option>หจก. รุ่งกิจรีไซเคิล</option>
                  </select>
                </FieldLabel>
                <FieldLabel label="โรงงานปลายทาง" required>
                  <select
                    className={inputClassName}
                    value={plantId}
                    onChange={(event) => setPlantId(event.target.value)}
                    required
                  >
                    {plants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name} · {plant.location}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="เกรดเศษเหล็ก" required>
                  <select
                    className={inputClassName}
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    required
                  >
                    <option>Bundle SY</option>
                    <option>Local O</option>
                    <option>Scrap Return SP</option>
                    <option>PM Scrap L1</option>
                    <option>Scrap (D)</option>
                  </select>
                </FieldLabel>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-bold text-slate-500">
                02 · วัน เวลา และปริมาณ
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <FieldLabel label="วันที่ส่ง" required>
                  <input
                    className={inputClassName}
                    type="date"
                    value={date}
                    min="2026-10-27"
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </FieldLabel>
                <FieldLabel label="ช่วงเวลาจอง" required>
                  <select
                    className={inputClassName}
                    value={timeSlot}
                    onChange={(event) => setTimeSlot(event.target.value)}
                  >
                    <option>08:00–09:00</option>
                    <option>09:00–10:00</option>
                    <option>10:00–11:00</option>
                    <option>11:00–12:00</option>
                    <option>13:00–14:00</option>
                    <option>14:00–15:00</option>
                    <option>15:00–16:00</option>
                  </select>
                </FieldLabel>
                <FieldLabel label="ปริมาณโดยประมาณ (ตัน)" required>
                  <div className="relative">
                    <input
                      className={`${inputClassName} pr-12`}
                      type="number"
                      min="1"
                      max="100"
                      value={estimatedTons}
                      onChange={(event) => setEstimatedTons(event.target.value)}
                      required
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-400">
                      ตัน
                    </span>
                  </div>
                </FieldLabel>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500">
                  03 · รถขนส่งและผู้ขับ
                </p>
                <button
                  type="button"
                  onClick={onGoToRegistry}
                  className="text-xs font-semibold text-sys-600 hover:text-sys-800"
                >
                  ลงทะเบียนคนขับ / รถ
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldLabel label="ผู้ขับที่ผ่านการอนุมัติ" required>
                  <select
                    className={inputClassName}
                    value={driverId}
                    onChange={(event) => setDriverId(event.target.value)}
                    required
                  >
                    {approvedDrivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} · {driver.carrier}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="บริษัทขนส่ง · ทะเบียนรถ">
                  <div className={`${inputClassName} flex items-center gap-2 bg-slate-50 text-slate-500`}>
                    <Icon name="truck" size={16} />
                    <span className="truncate">
                      {selectedDriver
                        ? `${selectedDriver.carrier} · ${selectedDriver.plate}`
                        : "เลือกผู้ขับที่อนุมัติแล้ว"}
                    </span>
                  </div>
                </FieldLabel>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Icon name="shield" size={13} />
                แสดงเฉพาะผู้ขับที่ลงทะเบียนภายใต้บริษัทขนส่งและผ่านการอนุมัติแล้ว
              </p>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-bold text-slate-500">
                04 · เอกสารประกอบ
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sys-200 bg-sys-50/40 px-4 py-6 text-center transition hover:bg-sys-50">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sys-600 shadow-sm">
                  <Icon name="file" size={20} />
                </span>
                <span className="mt-3 text-sm font-semibold text-sys-800">
                  แนบใบชั่งต้นทาง
                  <span className="ml-1 text-rose-500">*</span>
                </span>
                <span className="mt-1 text-xs text-slate-400">
                  รองรับ PDF, JPG, PNG · เลือกไฟล์เพื่อแทนที่ไฟล์ตัวอย่าง
                </span>
                <span className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-sys-700 shadow-sm">
                  {ticketName || "เลือกไฟล์"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={(event) =>
                    setTicketName(event.target.files?.[0]?.name ?? "")
                  }
                />
              </label>
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {formError}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400">
                * ข้อมูลจำเป็นสำหรับสร้างใบนำส่ง
              </p>
              <Button type="submit">
                <Icon name="qr" size={16} />
                ยืนยันจองและออกใบนำส่ง
              </Button>
            </div>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-bold text-sys-900">
                ขั้นตอนการส่งเศษเหล็ก
              </h3>
            </div>
            <div className="space-y-0 px-5 py-2">
              {deliverySteps.map((step, index) => (
                <div key={step.title} className="flex gap-3 py-4">
                  <div className="relative">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-sys-50 text-sys-700">
                      <Icon name={step.icon} size={17} />
                    </div>
                    {index < 3 && (
                      <span className="absolute left-[17px] top-10 h-5 w-px bg-slate-200" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {String(index + 1).padStart(2, "0")} · {step.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sys-900">คิวล่าสุด</h3>
              <span className="text-[11px] text-slate-400">วันนี้</span>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {recent.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sys-50 text-sys-700">
                    <Icon name="truck" size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {booking.retailer}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {booking.id} · {booking.timeSlot}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {createdBooking && (
        <div id="new-delivery-slip">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Icon name="circle-check" size={18} />
            จองคิวสำเร็จ · ใบนำส่งพร้อมใช้งาน
          </div>
          <DeliverySlip
            booking={createdBooking}
            onStatusChange={(id, status) => {
              onStatusChange(id, status);
              setCreatedBooking({ ...createdBooking, status });
            }}
          />
        </div>
      )}
    </div>
  );
}
