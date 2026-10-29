"use client";

import { useState, type FormEvent } from "react";
import { demoDate, policyVersion } from "@/app/data/mock-data";
import {
  getBlacklistReason,
  hasCurrentPolicyAcknowledgement,
} from "@/app/data/eligibility";
import {
  schedulePlant,
} from "@/app/data/scheduling";
import type { CapacityResolver } from "@/app/data/slot-capacity";
import { bookableSlots } from "@/app/data/slot-time";
import { DeliverySlip } from "@/app/components/delivery-slip";
import { Icon, type IconName } from "@/app/components/icons";
import {
  Button,
  FieldLabel,
  inputClassName,
  Panel,
} from "@/app/components/ui";
import type {
  BlacklistRecord,
  DeliveryDraft,
  DemoUser,
  DriverRecord,
  PlanRow,
  PolicyAcknowledgement,
  QueueBooking,
} from "@/app/types/queue";

type NewBooking = Omit<
  QueueBooking,
  "id" | "createdAt" | "status" | "plantId"
>;
type EmploymentType = DriverRecord["employmentType"];

interface BookingCreationResult {
  booking?: QueueBooking;
  error?: string;
}

interface DeliveryVehicle {
  key: string;
  carrier: string;
  plate: string;
  drivers: DriverRecord[];
}

export const retailerNames = [
  "ร้านสมชายค้าเหล็ก",
  "ร้านเจริญทรัพย์",
  "ร้านรุ่งเรืองโลหะ",
  "ร้านทองดี รีไซเคิล",
];

const wizardSteps: { title: string; icon: IconName }[] = [
  { title: "ข้อมูลการจัดส่ง", icon: "document" },
  { title: "รถยนต์", icon: "truck" },
  { title: "พนักงานขับรถยนต์", icon: "user" },
];

function getVehicleKey(driver: Pick<DriverRecord, "carrier" | "plate">) {
  return `${driver.carrier}::${driver.plate}`;
}

function WeightInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const numericValue = Number(value) || 0;

  return (
    <FieldLabel label={label} required>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`ลด${label} 100 กิโลกรัม`}
          disabled={numericValue <= 0}
          onClick={() => onChange(String(Math.max(0, numericValue - 100)))}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <input
          className={inputClassName}
          type="number"
          min="0"
          step="100"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          type="button"
          aria-label={`เพิ่ม${label} 100 กิโลกรัม`}
          onClick={() => onChange(String(numericValue + 100))}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
        >
          +
        </button>
      </div>
    </FieldLabel>
  );
}

export function BookingPage({
  user,
  drivers,
  blacklist,
  plans,
  bookings,
  acknowledgements,
  onCreate,
  onGoToRegistry,
  onAcknowledgePolicies,
  resolveCapacity,
  draft,
  viewBooking,
  onDraftChange,
  onCompleteDraft,
  onReturnToList,
  verificationCodes,
  onGenerateVerificationCode,
}: {
  user: DemoUser;
  drivers: DriverRecord[];
  blacklist: BlacklistRecord[];
  plans: PlanRow[];
  bookings: QueueBooking[];
  resolveCapacity: CapacityResolver;
  acknowledgements: PolicyAcknowledgement[];
  onCreate: (booking: NewBooking) => BookingCreationResult;
  onGoToRegistry: () => void;
  onAcknowledgePolicies: (shopName: string) => boolean;
  draft: DeliveryDraft;
  viewBooking?: QueueBooking;
  onDraftChange: (draft: DeliveryDraft) => void;
  onCompleteDraft: (draftId: string) => void;
  onReturnToList: () => void;
  verificationCodes: Record<string, string>;
  onGenerateVerificationCode: (bookingId: string) => string | null;
}) {
  const ownShop = "ร้านสมชายค้าเหล็ก";
  const [step, setStep] = useState<0 | 1 | 2 | 3>(
    viewBooking ? 3 : draft.step,
  );
  const [retailer, setRetailer] = useState(draft.retailer || ownShop);
  const [broker, setBroker] = useState(draft.broker || "—");
  const [grade, setGrade] = useState(draft.grade || "Bundle SY");
  const [date, setDate] = useState(draft.date || demoDate);
  const [timeSlot, setTimeSlot] = useState(
    draft.timeSlot || bookableSlots[1],
  );
  const [heavyWeightKg, setHeavyWeightKg] = useState(
    draft.heavyWeightKg || "40000",
  );
  const [lightWeightKg, setLightWeightKg] = useState(
    draft.lightWeightKg || "12000",
  );
  const [ticketName, setTicketName] = useState(
    draft.ticketName || "ใบชั่งต้นทาง_ตัวอย่าง.pdf",
  );
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataUseAccepted, setDataUseAccepted] = useState(false);
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
  const [vehicleKey, setVehicleKey] = useState(() =>
    draft.carrier && draft.plate
      ? `${draft.carrier}::${draft.plate}`
      : approvedDrivers[0]
        ? getVehicleKey(approvedDrivers[0])
        : "",
  );
  const selectedVehicle = vehicles.find((vehicle) => vehicle.key === vehicleKey);
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>(draft.employmentType || "contractor");
  const [driverId, setDriverId] = useState(draft.driverId);
  const [createdBooking, setCreatedBooking] = useState<QueueBooking | null>(
    viewBooking ?? null,
  );
  const [formError, setFormError] = useState("");
  const heavyWeight = Number(heavyWeightKg);
  const lightWeight = Number(lightWeightKg);
  const hasValidWeights =
    Number.isFinite(heavyWeight) &&
    Number.isFinite(lightWeight) &&
    heavyWeight > 0 &&
    lightWeight > 0;
  const estimatedTons = (heavyWeight - lightWeight) / 1000;
  const schedule = schedulePlant(
    { date, timeSlot, grade, estimatedTons },
    plans,
    bookings,
    resolveCapacity,
  );
  const shopHasAcknowledged = hasCurrentPolicyAcknowledgement(
    retailer,
    policyVersion,
    acknowledgements,
  );
  const availableDrivers =
    selectedVehicle?.drivers.filter(
      (driver) => driver.employmentType === employmentType,
    ) ?? [];
  const selectedDriver =
    availableDrivers.find((driver) => driver.id === driverId) ??
    availableDrivers[0];
  const selectedDriverBlacklistReasons = selectedDriver
    ? getBlacklistReason(selectedDriver.id, selectedDriver.plate, blacklist)
    : [];

  function getCurrentDraft(savedStep: 0 | 1 | 2 = step === 3 ? 2 : step) {
    return {
      id: draft.id,
      step: savedStep,
      retailer,
      broker,
      grade,
      date,
      timeSlot,
      heavyWeightKg,
      lightWeightKg,
      ticketName,
      driverId,
      employmentType,
      carrier: selectedVehicle?.carrier ?? "",
      plate: selectedVehicle?.plate ?? "",
      driver: selectedDriver?.name ?? "",
    };
  }

  function saveDraft() {
    onDraftChange(getCurrentDraft());
    onReturnToList();
  }

  function continueToVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!hasValidWeights) {
      setFormError("กรุณาระบุน้ำหนักชั่งหนักและชั่งเบาให้มากกว่า 0 กิโลกรัม");
      return;
    }
    if (estimatedTons <= 0) {
      setFormError("น้ำหนักชั่งหนักต้องมากกว่าน้ำหนักชั่งเบา");
      return;
    }
    if (!shopHasAcknowledged) {
      if (
        user.role === "retailer" &&
        privacyAccepted &&
        dataUseAccepted
      ) {
        const saved = onAcknowledgePolicies(retailer);
        if (!saved) {
          setFormError("บันทึกการยอมรับนโยบายไม่สำเร็จ จึงยังดำเนินการต่อไม่ได้");
          return;
        }
      } else {
        setFormError(
          "ร้านค้าต้องเข้าสู่ระบบและยอมรับนโยบาย PDPA ทั้งสองฉบับก่อนสร้างใบนำส่ง",
        );
        return;
      }
    }
    if (!schedule.available) {
      setFormError(schedule.reason);
      return;
    }
    onDraftChange(getCurrentDraft(1));
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
    if (!hasValidWeights || estimatedTons <= 0) {
      setFormError("กรุณาตรวจสอบน้ำหนักชั่งหนักและชั่งเบาให้ถูกต้อง");
      setStep(0);
      return;
    }
    if (selectedDriverBlacklistReasons.length > 0) {
      setFormError(
        `ไม่สามารถสร้างใบนำส่งได้: ${selectedDriverBlacklistReasons.join(" · ")}`,
      );
      return;
    }
    const creation = onCreate({
      retailer,
      broker,
      grade,
      heavyWeightKg: heavyWeight,
      lightWeightKg: lightWeight,
      estimatedTons,
      date,
      timeSlot,
      driver: selectedDriver.name,
      carrier: selectedVehicle.carrier,
      plate: selectedVehicle.plate,
      ticketName,
    });
    if (creation.error || !creation.booking) {
      setFormError(creation.error ?? "ไม่สามารถสร้างใบนำส่งได้ กรุณาลองอีกครั้ง");
      setStep(0);
      return;
    }
    setCreatedBooking(creation.booking);
    setFormError("");
    onCompleteDraft(draft.id);
    setStep(3);
  }

  function startNewBooking() {
    onReturnToList();
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onReturnToList}
        className="inline-flex items-center gap-2 text-sm font-semibold text-sys-700 hover:text-sys-900"
      >
        <Icon name="arrow" size={15} className="rotate-180" />
        กลับไปรายการใบนำส่ง
      </button>
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <h2 className="text-base font-bold text-sys-900">
            {viewBooking
              ? "รายละเอียดใบนำส่ง"
              : draft.step > 0
                ? "แก้ไขใบนำส่งเศษเหล็ก"
                : "สร้างใบนำส่งเศษเหล็ก"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            กรอกข้อมูลตามลำดับขั้นตอนเพื่อออกใบนำส่ง
          </p>
        </div>

        <div
          className="scrollbar-thin overflow-x-auto px-4 py-4 sm:px-7"
          aria-label="ขั้นตอนการสร้างใบนำส่ง"
        >
          <ol className="grid min-w-[640px] grid-cols-3">
            {wizardSteps.map((wizardStep, index) => {
              const complete = index < step;
              const current = index === step;
              return (
                <li
                  key={wizardStep.title}
                  aria-current={current ? "step" : undefined}
                  style={{
                    clipPath:
                      index === 0
                        ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
                        : index === wizardSteps.length - 1
                          ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
                          : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
                  }}
                  className={`relative -mr-3 flex min-h-[58px] items-center gap-2 px-4 py-2 text-xs font-semibold sm:gap-3 sm:px-6 ${
                    index === 0
                      ? "z-30"
                      : index === 1
                        ? "z-20"
                        : "z-10 mr-0"
                  } ${
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
                <span className="text-xs text-slate-400">ขั้นตอน 1 จาก 3</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FieldLabel label="ร้านค้าของเก่า" required>
                  <select
                    className={inputClassName}
                    value={retailer}
                    onChange={(event) => {
                      setRetailer(event.target.value);
                      setPrivacyAccepted(false);
                      setDataUseAccepted(false);
                    }}
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
                <div className="rounded-xl border border-sys-100 bg-sys-50/60 p-3.5">
                  <p className="text-xs font-medium text-slate-500">
                    โรงงานปลายทาง · ระบบจัดสรรอัตโนมัติ
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    ระบบจะเลือกโรงงานและจัดสรรคิวที่เหมาะสมให้โดยอัตโนมัติ
                  </p>
                </div>
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
                    {bookableSlots.map((slot) => (
                      <option key={slot}>{slot}</option>
                    ))}
                  </select>
                </FieldLabel>
                <WeightInput
                  label="น้ำหนักชั่งหนัก (กิโลกรัม)"
                  value={heavyWeightKg}
                  onChange={setHeavyWeightKg}
                />
                <WeightInput
                  label="น้ำหนักชั่งเบา (กิโลกรัม)"
                  value={lightWeightKg}
                  onChange={setLightWeightKg}
                />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                น้ำหนักสุทธิ:{" "}
                {Math.max(0, heavyWeight - lightWeight).toLocaleString("th-TH")}{" "}
                กิโลกรัม (ชั่งหนัก − ชั่งเบา)
              </div>

              {!shopHasAcknowledged && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    ต้องรับทราบนโยบาย PDPA ก่อนสร้างใบนำส่ง
                  </p>
                  {user.role === "retailer" ? (
                    <div className="mt-3 space-y-2.5 text-xs text-amber-900">
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(event) =>
                            setPrivacyAccepted(event.target.checked)
                          }
                          className="mt-0.5 accent-amber-700"
                        />
                        ข้าพเจ้ารับทราบประกาศคุ้มครองข้อมูลส่วนบุคคล ฉบับ {policyVersion}
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={dataUseAccepted}
                          onChange={(event) =>
                            setDataUseAccepted(event.target.checked)
                          }
                          className="mt-0.5 accent-amber-700"
                        />
                        ข้าพเจ้ายอมรับการใช้ข้อมูลส่วนบุคคลตามวัตถุประสงค์และระยะเวลาที่แจ้ง ฉบับ {policyVersion}
                      </label>
                      <p className="text-[11px] text-amber-800">
                        ระบบจะบันทึกบัญชีผู้ยอมรับ เวลา และเวอร์ชันของเอกสารทั้งสองฉบับ
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-amber-800">
                      กรุณาให้ผู้ใช้ร้านค้าเข้าสู่ระบบและกดยอมรับด้วยตนเองก่อน
                      นายหน้า/Admin จึงจะสร้างใบนำส่งแทนร้านนี้ได้
                    </p>
                  )}
                </div>
              )}

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
            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
              <Button type="button" variant="secondary" onClick={saveDraft}>
                <Icon name="document" size={16} />
                บันทึก
              </Button>
              <Button type="submit" disabled={!hasValidWeights}>
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
                <span className="text-xs text-slate-400">ขั้นตอน 2 จาก 3</span>
              </div>

              {vehicles.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {vehicles.map((vehicle) => {
                    const selected = vehicle.key === vehicleKey;
                    const vehicleBlacklistReasons = getBlacklistReason(
                      "",
                      vehicle.plate,
                      blacklist,
                    );
                    const isBlacklisted = vehicleBlacklistReasons.length > 0;
                    return (
                      <button
                        type="button"
                        key={vehicle.key}
                        aria-pressed={selected}
                        disabled={isBlacklisted}
                        onClick={() => chooseVehicle(vehicle)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          isBlacklisted
                            ? "cursor-not-allowed border-rose-200 bg-rose-50/60 opacity-80"
                            : selected
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
                          {isBlacklisted && (
                            <span className="mt-2 block text-[11px] font-semibold text-rose-700">
                              Blacklist: {vehicleBlacklistReasons.join(" · ")}
                            </span>
                          )}
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
            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
              <Button variant="secondary" onClick={() => setStep(0)}>
                <Icon name="arrow" size={16} className="rotate-180" />
                กลับหน้าก่อน
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={saveDraft}>
                  <Icon name="document" size={16} />
                  บันทึก
                </Button>
                <Button
                  onClick={() => {
                    if (!selectedVehicle) {
                      setFormError("กรุณาเลือกรถยนต์ก่อนดำเนินการต่อ");
                      return;
                    }
                    setFormError("");
                    onDraftChange(getCurrentDraft(2));
                    setStep(2);
                  }}
                  disabled={!selectedVehicle}
                >
                  ถัดไป: พนักงานขับรถยนต์ <Icon name="arrow" size={16} />
                </Button>
              </div>
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
                <span className="text-xs text-slate-400">ขั้นตอน 3 จาก 3</span>
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
                          {getBlacklistReason(
                            driver.id,
                            driver.plate,
                            blacklist,
                          ).length > 0
                            ? " · ติด Blacklist"
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
                </FieldLabel>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Icon name="shield" size={13} />
                  ตรวจสอบ blacklist ของรถและผู้ขับก่อนออกใบนำส่ง
                </p>
                {selectedDriverBlacklistReasons.length > 0 && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
                  >
                    ไม่สามารถใช้ผู้ขับ/รถนี้ได้:{" "}
                    {selectedDriverBlacklistReasons.join(" · ")}
                  </p>
                )}
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
            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onDraftChange(getCurrentDraft(1));
                  setStep(1);
                }}
              >
                <Icon name="arrow" size={16} className="rotate-180" />
                กลับหน้าก่อน
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={saveDraft}>
                  <Icon name="document" size={16} />
                  บันทึก
                </Button>
                <Button type="submit" disabled={!selectedDriver}>
                  <Icon name="check" size={16} />
                  บันทึกข้อมูล
                </Button>
              </div>
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
                กลับไปรายการใบนำส่ง
              </Button>
            </div>
            <DeliverySlip
              booking={createdBooking}
              verificationCode={verificationCodes[createdBooking.id]}
              onGenerateVerificationCode={onGenerateVerificationCode}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
