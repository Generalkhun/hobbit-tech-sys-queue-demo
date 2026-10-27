"use client";

import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { demoDate, plants } from "@/app/data/mock-data";
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
type EmploymentType = DriverRecord["employmentType"];

interface DeliveryVehicle {
  key: string;
  carrier: string;
  plate: string;
  drivers: DriverRecord[];
}

const retailerNames = [
  "ร้านสมชายค้าเหล็ก",
  "ร้านเจริญทรัพย์",
  "ร้านรุ่งเรืองโลหะ",
  "ร้านทองดี รีไซเคิล",
];

const wizardSteps: { title: string; icon: IconName }[] = [
  { title: "ข้อมูลการจัดส่ง", icon: "document" },
  { title: "รถยนต์", icon: "truck" },
  { title: "พนักงานขับรถยนต์", icon: "user" },
  { title: "บันทึกข้อมูลสำเร็จ", icon: "check" },
];

function getVehicleKey(driver: Pick<DriverRecord, "carrier" | "plate">) {
  return `${driver.carrier}::${driver.plate}`;
}

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
  const slipFields = [
    ["เลขที่ใบนำส่ง", booking.id],
    [
      "วันที่ส่ง",
      new Date(`${booking.date}T00:00:00`).toLocaleDateString("th-TH"),
    ],
    ["โรงงานปลายทาง", booking.plantId],
    ["ช่วงเวลาเข้ารับ", `${booking.timeSlot} น.`],
    ["ร้านค้าของเก่า", booking.retailer],
    ["ผู้ขาย / นายหน้า", booking.broker],
    ["เกรดเศษเหล็ก", booking.grade],
    ["ปริมาณโดยประมาณ", `${booking.estimatedTons} ตัน`],
    ["ชื่อผู้ขับ", booking.driver],
    ["บริษัทขนส่ง · ทะเบียนรถ", `${booking.carrier} · ${booking.plate}`],
  ];

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
          {slipFields.map(([label, value]) => (
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
          <Button variant="secondary" onClick={() => window.print()}>
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
  onCreate,
  onStatusChange,
  onGoToRegistry,
}: {
  user: DemoUser;
  drivers: DriverRecord[];
  onCreate: (booking: NewBooking) => QueueBooking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onGoToRegistry: () => void;
}) {
  const ownShop = "ร้านสมชายค้าเหล็ก";
  const [step, setStep] = useState(0);
  const [retailer, setRetailer] = useState(
    user.role === "retailer" ? ownShop : retailerNames[0],
  );
  const [broker, setBroker] = useState(
    user.role === "broker" ? "บริษัท เอส.เอส. เมทัล" : "—",
  );
  const [plantId, setPlantId] = useState(plants[0].id);
  const [grade, setGrade] = useState("Bundle SY");
  const [date, setDate] = useState(demoDate);
  const [timeSlot, setTimeSlot] = useState("08:00–09:00");
  const [estimatedTons, setEstimatedTons] = useState("28");
  const [ticketName, setTicketName] = useState("ใบชั่งต้นทาง_ตัวอย่าง.pdf");
  const approvedDrivers = drivers.filter((driver) => driver.approved);
  const vehicles: DeliveryVehicle[] = approvedDrivers.reduce(
    (available, driver) => {
      const key = getVehicleKey(driver);
      const existing = available.find((vehicle) => vehicle.key === key);
      if (existing) {
        existing.drivers.push(driver);
      } else {
        available.push({
          key,
          carrier: driver.carrier,
          plate: driver.plate,
          drivers: [driver],
        });
      }
      return available;
    },
    [] as DeliveryVehicle[],
  );
  const [vehicleKey, setVehicleKey] = useState(() => {
    const firstApproved = drivers.find((driver) => driver.approved);
    return firstApproved ? getVehicleKey(firstApproved) : "";
  });
  const selectedVehicle = vehicles.find((vehicle) => vehicle.key === vehicleKey);
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("contractor");
  const [driverId, setDriverId] = useState("");
  const [createdBooking, setCreatedBooking] = useState<QueueBooking | null>(
    null,
  );
  const [formError, setFormError] = useState("");
  const availableDrivers =
    selectedVehicle?.drivers.filter(
      (driver) => driver.employmentType === employmentType,
    ) ?? [];
  const selectedDriver =
    availableDrivers.find((driver) => driver.id === driverId) ??
    availableDrivers[0];

  function continueToVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setStep(1);
  }

  function chooseVehicle(vehicle: DeliveryVehicle) {
    setVehicleKey(vehicle.key);
    const preferredType = vehicle.drivers[0]?.employmentType ?? "contractor";
    setEmploymentType(preferredType);
    setDriverId(vehicle.drivers[0]?.id ?? "");
    setFormError("");
  }

  function saveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedVehicle) {
      setFormError("กรุณาเลือกรถยนต์ก่อนบันทึกข้อมูล");
      return;
    }
    if (!selectedDriver?.approved) {
      setFormError("กรุณาเลือกพนักงานขับรถที่ผ่านการอนุมัติแล้ว");
      return;
    }
    if (!ticketName) {
      setFormError("กรุณาแนบใบชั่งต้นทางก่อนบันทึกข้อมูล");
      setStep(0);
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
      carrier: selectedVehicle.carrier,
      plate: selectedVehicle.plate,
      ticketName,
    });
    setCreatedBooking(saved);
    setFormError("");
    setStep(3);
  }

  function startNewBooking() {
    setStep(0);
    setCreatedBooking(null);
    setFormError("");
  }

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <h2 className="text-base font-bold text-sys-900">
            สร้างใบนำส่งเศษเหล็ก
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            กรอกข้อมูลตามลำดับขั้นตอนเพื่อออกใบนำส่ง
          </p>
        </div>

        <div
          className="scrollbar-thin overflow-x-auto px-4 py-4 sm:px-7"
          aria-label="ขั้นตอนการสร้างใบนำส่ง"
        >
          <ol className="grid min-w-[640px] grid-cols-4 gap-2 sm:gap-3">
            {wizardSteps.map((wizardStep, index) => {
              const complete = index < step;
              const current = index === step;
              return (
                <li
                  key={wizardStep.title}
                  aria-current={current ? "step" : undefined}
                  className={`flex min-h-[54px] items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold sm:gap-3 sm:px-4 ${
                    complete
                      ? "bg-emerald-600 text-white"
                      : current
                        ? "bg-sys-600 text-white"
                        : "bg-sys-50 text-sys-600"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      complete || current
                        ? "bg-white/20"
                        : "bg-white text-sys-600"
                    }`}
                  >
                    {complete ? (
                      <Icon name="check" size={16} />
                    ) : (
                      <Icon name={wizardStep.icon} size={16} />
                    )}
                  </span>
                  <span className="leading-4">{wizardStep.title}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {step === 0 && (
          <form onSubmit={continueToVehicle}>
            <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-sys-900">ข้อมูลการจัดส่ง</h3>
                <span className="text-xs text-slate-400">ขั้นตอน 1 จาก 4</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <FieldLabel label="วันที่ส่ง" required>
                  <input
                    className={inputClassName}
                    type="date"
                    value={date}
                    min={demoDate}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </FieldLabel>
                <FieldLabel label="ช่วงเวลาจอง" required>
                  <select
                    className={inputClassName}
                    value={timeSlot}
                    onChange={(event) => setTimeSlot(event.target.value)}
                    required
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
                  <input
                    className={inputClassName}
                    type="number"
                    min="1"
                    max="100"
                    value={estimatedTons}
                    onChange={(event) => setEstimatedTons(event.target.value)}
                    required
                  />
                </FieldLabel>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  ใบชั่งต้นทาง <span className="text-rose-500">*</span>
                </p>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-sys-200 bg-sys-50/40 px-4 py-6 text-center transition hover:bg-sys-50">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sys-600 shadow-sm">
                    <Icon name="file" size={20} />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-sys-800">
                    คลิกเพื่อแนบใบชั่งต้นทาง
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    รองรับ PDF, JPG, PNG · {ticketName || "ยังไม่ได้เลือกไฟล์"}
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
            </div>

            {formError && (
              <p role="alert" className="mx-5 mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-7">
                {formError}
              </p>
            )}
            <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-7">
              <Button type="submit">
                ถัดไป: รถยนต์ <Icon name="arrow" size={16} />
              </Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div>
            <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sys-900">เลือกรถยนต์</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    เลือกรถที่ลงทะเบียนและผ่านการอนุมัติแล้ว
                  </p>
                </div>
                <span className="text-xs text-slate-400">ขั้นตอน 2 จาก 4</span>
              </div>

              {vehicles.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {vehicles.map((vehicle) => {
                    const selected = vehicle.key === vehicleKey;
                    return (
                      <button
                        type="button"
                        key={vehicle.key}
                        aria-pressed={selected}
                        onClick={() => chooseVehicle(vehicle)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-sys-500 bg-sys-50 ring-2 ring-sys-100"
                            : "border-slate-200 hover:border-sys-200 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                            selected
                              ? "bg-sys-600 text-white"
                              : "bg-sys-50 text-sys-700"
                          }`}
                        >
                          <Icon name="truck" size={21} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-sys-900">
                            {vehicle.plate}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-500">
                            {vehicle.carrier}
                          </span>
                          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <Icon name="shield" size={13} />
                            อนุมัติแล้ว
                          </span>
                        </span>
                        <span
                          className={`mt-1 h-4 w-4 rounded-full border ${
                            selected
                              ? "border-[5px] border-sys-600 bg-white"
                              : "border-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    ยังไม่มีรถที่ได้รับอนุมัติ
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    ลงทะเบียนรถและรอผู้ดูแลระบบอนุมัติก่อนสร้างใบนำส่ง
                  </p>
                </div>
              )}
              {selectedVehicle && (
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-sys-50/70 px-4 py-3">
                  <Icon name="circle-check" size={18} className="text-sys-600" />
                  <p className="text-xs text-sys-800">
                    เลือกรถ{" "}
                    <span className="font-bold">{selectedVehicle.plate}</span>
                    {" · "}
                    {selectedVehicle.carrier}
                  </p>
                </div>
              )}
            </div>
            {formError && (
              <p role="alert" className="mx-5 mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-7">
                {formError}
              </p>
            )}
            <div className="flex justify-between border-t border-slate-100 px-5 py-4 sm:px-7">
              <Button variant="secondary" onClick={() => setStep(0)}>
                <Icon name="arrow" size={16} className="rotate-180" />
                กลับหน้าก่อน
              </Button>
              <Button
                onClick={() => {
                  if (!selectedVehicle) {
                    setFormError("กรุณาเลือกรถยนต์ก่อนดำเนินการต่อ");
                    return;
                  }
                  setFormError("");
                  setStep(2);
                }}
                disabled={!selectedVehicle}
              >
                ถัดไป: พนักงานขับรถยนต์ <Icon name="arrow" size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={saveBooking}>
            <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sys-900">
                    ข้อมูลพนักงานขับรถยนต์
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    รถ {selectedVehicle?.plate ?? "—"} ·{" "}
                    {selectedVehicle?.carrier ?? "ยังไม่ได้เลือกรถ"}
                  </p>
                </div>
                <span className="text-xs text-slate-400">ขั้นตอน 3 จาก 4</span>
              </div>

              <fieldset>
                <legend className="mb-3 text-sm font-medium text-slate-700">
                  ประเภทพนักงานขับรถยนต์
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["contractor", "พนักงานขับรถรับจ้าง"],
                      ["employee", "พนักงานขับรถบริษัท"],
                    ] as const
                  ).map(([type, label]) => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                        employmentType === type
                          ? "border-sys-400 bg-sys-50/60"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="employmentType"
                        value={type}
                        checked={employmentType === type}
                        onChange={() => {
                          setEmploymentType(type);
                          setDriverId("");
                        }}
                        className="h-4 w-4 accent-sys-600"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 max-w-xl">
                <FieldLabel label="พนักงานขับรถยนต์" required>
                  <select
                    className={inputClassName}
                    value={selectedDriver?.id ?? ""}
                    onChange={(event) => setDriverId(event.target.value)}
                    disabled={availableDrivers.length === 0}
                    required
                  >
                    {availableDrivers.length === 0 ? (
                      <option value="">
                        ไม่พบพนักงานประเภทนี้สำหรับรถที่เลือก
                      </option>
                    ) : (
                      availableDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} · {driver.phone}
                        </option>
                      ))
                    )}
                  </select>
                </FieldLabel>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Icon name="shield" size={13} />
                  แสดงเฉพาะพนักงานที่ลงทะเบียนและผ่านการอนุมัติแล้ว
                </p>
                {availableDrivers.length === 0 && (
                  <button
                    type="button"
                    onClick={onGoToRegistry}
                    className="mt-3 text-xs font-semibold text-sys-600 hover:text-sys-800"
                  >
                    ลงทะเบียนพนักงานขับรถยนต์
                  </button>
                )}
              </div>

              {formError && (
                <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}
            </div>
            <div className="flex justify-between border-t border-slate-100 px-5 py-4 sm:px-7">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                <Icon name="arrow" size={16} className="rotate-180" />
                กลับหน้าก่อน
              </Button>
              <Button type="submit" disabled={!selectedDriver}>
                <Icon name="check" size={16} />
                บันทึกข้อมูล
              </Button>
            </div>
          </form>
        )}

        {step === 3 && createdBooking && (
          <div
            id="new-delivery-slip"
            className="space-y-5 border-t border-slate-100 px-5 py-6 sm:px-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Icon name="circle-check" size={19} />
                  บันทึกข้อมูลสำเร็จ
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  ใบนำส่งพร้อม QR Code สำหรับยืนยันรถที่ป้อม รปภ.
                </p>
              </div>
              <Button variant="secondary" onClick={startNewBooking}>
                <Icon name="plus" size={16} />
                สร้างใบนำส่งรายการใหม่
              </Button>
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
      </Panel>
    </div>
  );
}
