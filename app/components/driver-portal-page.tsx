"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { DeliverySlip } from "@/app/components/delivery-slip";
import { Button, FieldLabel, inputClassName, Panel } from "@/app/components/ui";
import { plants } from "@/app/data/mock-data";
import type {
  DriverCheckinProgress,
  DriverRecord,
  PageKey,
  QueueBooking,
} from "@/app/types/queue";

const checkinRadiusKm = 10;

function distanceInKm(
  latitude: number,
  longitude: number,
  targetLatitude: number,
  targetLongitude: number,
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(targetLatitude - latitude);
  const longitudeDelta = radians(targetLongitude - longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(targetLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function WorkDetails({ booking }: { booking: QueueBooking }) {
  const plant = plants.find((item) => item.id === booking.plantId);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        ["เลขที่ใบนำส่ง", booking.id],
        ["โรงงานปลายทาง", plant?.name ?? booking.plantId],
        ["ที่ตั้งโรงงาน", plant?.location ?? "—"],
        ["วันและเวลารับ", `${booking.date} · ${booking.timeSlot} น.`],
        ["ผู้ส่งเหล็ก", booking.broker === "—" ? booking.retailer : booking.broker],
        ["ร้านค้า", booking.retailer],
        ["เกรด", booking.grade],
        ["น้ำหนักสุทธิประมาณ", `${booking.estimatedTons * 1000} กก.`],
        ["รถขนส่ง", `${booking.carrier} · ${booking.plate}`],
        ["ชื่อผู้ขับ", booking.driver],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function DriverPortalPage({
  page,
  driver,
  bookings,
  progress,
  contactPhones,
  onProgressChange,
  onContactPhonesChange,
  onVerifyCode,
  onNavigate,
}: {
  page: PageKey;
  driver: DriverRecord;
  bookings: QueueBooking[];
  progress: DriverCheckinProgress;
  contactPhones: string[];
  onProgressChange: (progress: DriverCheckinProgress) => void;
  onContactPhonesChange: (phones: string[]) => void;
  onVerifyCode: (bookingId: string, code: string) => string | null;
  onNavigate: (page: PageKey) => void;
}) {
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [locationError, setLocationError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [isEditingPhones, setIsEditingPhones] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneDrafts, setPhoneDrafts] = useState(contactPhones);
  const contactPhone = contactPhones[0] ?? "";
  const assignedBookings = bookings.filter(
    (booking) => booking.driver === driver.name,
  );
  const activeBookings = assignedBookings.filter(
    (booking) => booking.status !== "completed",
  );
  const selectedBooking =
    activeBookings.find(
      (booking) => booking.id === (progress.bookingId || selectedBookingId),
    ) ?? activeBookings[0];
  const checkinBooking =
    assignedBookings.find((booking) => booking.id === progress.bookingId) ??
    selectedBooking;

  function beginRemoteCheckin() {
    setLocationError("");
    if (!selectedBooking) {
      setLocationError("ไม่พบงานที่ยังเปิดให้เช็คอินสำหรับบัญชีคนขับนี้");
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    const plant = plants.find((item) => item.id === selectedBooking.plantId);
    if (!plant) {
      setLocationError("ไม่พบพิกัดโรงงานปลายทางในระบบ");
      return;
    }

    setIsCheckingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsCheckingLocation(false);
        const distance = distanceInKm(
          position.coords.latitude,
          position.coords.longitude,
          plant.latitude,
          plant.longitude,
        );
        if (distance > checkinRadiusKm) {
          setLocationError(
            `ตำแหน่งปัจจุบันอยู่ห่างโรงงาน ${distance.toFixed(1)} กม. ต้องอยู่ในรัศมี ${checkinRadiusKm} กม. จึงจะเช็คอินได้`,
          );
          return;
        }
        onProgressChange({ bookingId: selectedBooking.id, step: "review" });
      },
      (error) => {
        setIsCheckingLocation(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "กรุณาอนุญาตให้เข้าถึงตำแหน่ง เพื่อเช็คอิน online"
            : error.code === error.POSITION_UNAVAILABLE
              ? "ไม่สามารถระบุตำแหน่งปัจจุบันได้ กรุณาลองอีกครั้ง"
              : "ใช้เวลาระบุตำแหน่งนานเกินไป กรุณาลองอีกครั้ง",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function confirmDriverDetails() {
    if (!checkinBooking) return;
    onProgressChange({ bookingId: checkinBooking.id, step: "contact" });
  }

  function confirmContactAndCode() {
    if (!checkinBooking) return;
    if (!/^[0-9+()\-\s]{9,15}$/.test(contactPhone.trim())) {
      setCodeError("กรุณากรอกเบอร์โทรศัพท์ติดต่อให้ถูกต้อง");
      return;
    }
    if (!/^\d{6}$/.test(verificationCode)) {
      setCodeError("กรุณากรอกรหัสยืนยัน 6 หลัก");
      return;
    }
    const error = onVerifyCode(checkinBooking.id, verificationCode);
    if (error) {
      setCodeError(error);
      return;
    }
    setCodeError("");
    onProgressChange({ bookingId: checkinBooking.id, step: "complete" });
    onNavigate("driver-queue");
  }

  function updatePrimaryContactPhone(phone: string) {
    onContactPhonesChange(
      contactPhones.length === 0
        ? [phone]
        : [phone, ...contactPhones.slice(1)],
    );
  }

  function saveContactPhones() {
    const phones = phoneDrafts.map((phone) => phone.trim()).filter(Boolean);
    if (phones.length === 0) {
      setPhoneError("กรุณาระบุเบอร์ติดต่ออย่างน้อย 1 เบอร์");
      return;
    }
    if (phones.length > 3) {
      setPhoneError("ระบุเบอร์ติดต่อได้สูงสุด 3 เบอร์");
      return;
    }
    if (phones.some((phone) => !/^[0-9+()\-\s]{9,15}$/.test(phone))) {
      setPhoneError("กรุณาตรวจสอบรูปแบบเบอร์โทรศัพท์");
      return;
    }
    setPhoneError("");
    onContactPhonesChange(phones);
    setIsEditingPhones(false);
  }

  if (page === "driver-pass") {
    return (
      <div className="space-y-4">
        <Panel className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-sys-900">ใบนำส่งสำหรับงานนี้</h2>
          <p className="mt-1 text-xs text-slate-500">
            ใบนำส่งฉบับเดียวกับที่พิมพ์ติดรถ พร้อม QR Code สำหรับสแกน
          </p>
        </Panel>
        {checkinBooking ? (
          <DeliverySlip
            key={checkinBooking.id}
            booking={checkinBooking}
            onGenerateVerificationCode={() => null}
            showVerificationSection={false}
            showPrintButton={false}
            showStatusBadge={false}
          />
        ) : (
          <Panel className="p-10 text-center text-sm text-slate-500">
            ยังไม่มีใบนำส่งที่กำหนดให้รถ/ผู้ขับของคุณ
          </Panel>
        )}
      </div>
    );
  }

  if (page === "driver-queue") {
    if (progress.step !== "complete") {
      return (
        <Panel className="mx-auto max-w-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-sys-900">
            ยังไม่ได้เช็คอิน online
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            เช็คอินและยืนยันตัวตนก่อน เพื่อติดตามสถานะรอคิว
          </p>
          <Button
            className="mt-6"
            onClick={() => onNavigate("driver-checkin")}
          >
            ไปหน้าเช็คอิน online
          </Button>
        </Panel>
      );
    }
    return (
      <Panel className="mx-auto max-w-2xl p-6 sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
          <Icon name="clock" size={30} />
        </div>
        <h2 className="mt-5 text-center text-xl font-bold text-sys-900">
          สถานะ: รอคิว
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          กรุณารอ SYS ติดต่อกลับที่เบอร์โทรศัพท์ที่บันทึกไว้ด้านล่าง
        </p>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-sys-900">
                เบอร์ติดต่อฉุกเฉิน
              </p>
              <p className="mt-1 text-xs text-slate-500">
                เพิ่มหรือแก้ไขเบอร์ที่ SYS ใช้ติดต่อได้ สูงสุด 3 เบอร์
              </p>
            </div>
            {!isEditingPhones && (
              <Button
                variant="secondary"
                onClick={() => {
                  setPhoneDrafts(contactPhones);
                  setPhoneError("");
                  setIsEditingPhones(true);
                }}
              >
                แก้ไขเบอร์ติดต่อ
              </Button>
            )}
          </div>
          {isEditingPhones ? (
            <>
              <div className="mt-4 space-y-3">
                {phoneDrafts.map((phone, index) => (
                  <div
                    key={`contact-phone-${index}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => {
                        const nextPhones = [...phoneDrafts];
                        nextPhones[index] = event.target.value;
                        setPhoneDrafts(nextPhones);
                        setPhoneError("");
                      }}
                      className={inputClassName}
                      aria-label={`เบอร์ติดต่อฉุกเฉิน ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      aria-label={`ลบเบอร์ติดต่อฉุกเฉิน ${index + 1}`}
                      onClick={() => {
                        setPhoneDrafts((current) =>
                          current.filter((_, phoneIndex) => phoneIndex !== index),
                        );
                        setPhoneError("");
                      }}
                    >
                      ลบ
                    </Button>
                  </div>
                ))}
                {phoneDrafts.length < 3 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPhoneDrafts((current) => [...current, ""])}
                  >
                    เพิ่มเบอร์โทร
                  </Button>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPhoneDrafts(contactPhones);
                    setPhoneError("");
                    setIsEditingPhones(false);
                  }}
                >
                  ยกเลิก
                </Button>
                <Button onClick={saveContactPhones}>บันทึกเบอร์โทร</Button>
              </div>
              {phoneError && (
                <p role="alert" className="mt-3 text-sm text-rose-700">
                  {phoneError}
                </p>
              )}
            </>
          ) : (
            <ol className="mt-4 space-y-2">
              {contactPhones.map((phone, index) => (
                <li
                  key={`${phone}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-sys-800"
                >
                  <span className="text-xs text-slate-400">
                    เบอร์ {index + 1}
                  </span>
                  <span>{phone}</span>
                  {index === 0 && (
                    <span className="ml-auto text-[11px] text-slate-400">
                      เบอร์หลัก
                    </span>
                  )}
                </li>
              ))}
              {contactPhones.length === 0 && (
                <li className="text-sm text-slate-500">ยังไม่ได้ระบุเบอร์ติดต่อ</li>
              )}
            </ol>
          )}
        </div>
        {checkinBooking && (
          <p className="mt-5 text-center text-xs text-slate-400">
            งาน {checkinBooking.id} · {checkinBooking.plantId}
          </p>
        )}
      </Panel>
    );
  }

  if (progress.step === "review" && checkinBooking) {
    return (
      <div className="space-y-5">
        <Panel className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-sys-900">ตรวจสอบข้อมูลงาน</h2>
          <p className="mt-1 text-xs text-slate-500">
            ตรวจสอบรายละเอียดใบนำส่งและข้อมูลผู้ขับ/รถก่อนยืนยัน
          </p>
          <div className="mt-5">
            <WorkDetails booking={checkinBooking} />
          </div>
        </Panel>
        <Panel className="p-5 sm:p-6">
          <h3 className="font-bold text-sys-900">ประวัติคนขับและเอกสาร</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["ชื่อคนขับ", driver.name],
              ["บัตรประชาชน", driver.nationalIdMasked ?? "ไม่มีข้อมูล"],
              ["ใบอนุญาตขับขี่", driver.licenseNumber ?? "ไม่มีข้อมูล"],
              ["ประวัติคนขับ", driver.drivingHistory ?? "ไม่มีข้อมูล"],
              ["บริษัทขนส่ง", driver.carrier],
              ["ทะเบียนรถ", `${driver.plate} · ${driver.employmentType === "employee" ? "พนักงานบริษัท" : "พนักงานรับจ้าง"}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ข้อมูลบัตรและประวัติเป็นข้อมูลตัวอย่างสำหรับ demo
          </p>
          <div className="mt-5 flex justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => onProgressChange({ bookingId: null, step: "landing" })}
            >
              กลับ
            </Button>
            <Button onClick={confirmDriverDetails}>ข้อมูลถูกต้อง · ต่อไป</Button>
          </div>
        </Panel>
      </div>
    );
  }

  if (progress.step === "contact" && checkinBooking) {
    return (
      <Panel className="mx-auto max-w-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-sys-900">ยืนยันตัวตนคนขับ</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          ขอรหัส 6 หลักจากผู้ส่งเหล็ก แล้วกรอกเบอร์โทรศัพท์ที่ SYS ใช้ติดต่อกลับ
        </p>
        <div className="mt-6 space-y-4">
          <FieldLabel label="เบอร์โทรศัพท์ติดต่อ" required>
            <input
              type="tel"
              value={contactPhone}
              onChange={(event) =>
                updatePrimaryContactPhone(event.target.value)
              }
              className={inputClassName}
              placeholder="เช่น 0812345678"
              required
            />
          </FieldLabel>
          <FieldLabel label="รหัสยืนยัน 6 หลักจากผู้ส่งเหล็ก" required>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={verificationCode}
              onChange={(event) => {
                setVerificationCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                );
                setCodeError("");
              }}
              className={`${inputClassName} text-center text-xl tracking-[0.5em]`}
              placeholder="••••••"
              required
            />
          </FieldLabel>
          {codeError && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {codeError}
            </p>
          )}
          <Button className="w-full" onClick={confirmContactAndCode}>
            ยืนยันและเช็คอิน <Icon name="arrow" size={16} />
          </Button>
        </div>
      </Panel>
    );
  }

  if (progress.step === "complete") {
    return (
      <Panel className="mx-auto max-w-2xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <Icon name="circle-check" size={32} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-sys-900">
          เช็คอิน online เรียบร้อย
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          ระบบจะแสดงสถานะรอคิว และ SYS จะติดต่อกลับที่เบอร์ {contactPhone}
        </p>
        <Button className="mt-6" onClick={() => onNavigate("driver-queue")}>
          ไปหน้าแถบรอคิว
        </Button>
        {activeBookings.some(
          (booking) => booking.id !== checkinBooking?.id,
        ) && (
          <button
            type="button"
            className="mt-4 block w-full text-sm font-semibold text-sys-700"
            onClick={() =>
              onProgressChange({ bookingId: null, step: "landing" })
            }
          >
            เช็คอินงานอื่น
          </button>
        )}
      </Panel>
    );
  }

  return (
    <Panel className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center p-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sys-50 text-sys-700">
        <Icon name="map" size={30} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-sys-900">
        เริ่มเช็คอินระยะไกล
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
        ต้องอยู่ห่างจากโรงงานปลายทางไม่เกิน {checkinRadiusKm} กิโลเมตร
        และอนุญาตให้ browser เข้าถึงตำแหน่งก่อนเริ่มเช็คอิน online
      </p>
      {activeBookings.length > 1 && (
        <label className="mt-5 flex w-full max-w-sm flex-col gap-2 text-left text-sm font-medium text-slate-700">
          เลือกงาน
          <select
            value={selectedBooking?.id ?? ""}
            onChange={(event) => {
              setSelectedBookingId(event.target.value);
              onProgressChange({ bookingId: event.target.value, step: "landing" });
            }}
            className={inputClassName}
          >
            {activeBookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.id} · {booking.plantId} · {booking.date}
              </option>
            ))}
          </select>
        </label>
      )}
      {selectedBooking && (
        <p className="mt-4 text-xs font-medium text-sys-700">
          งาน {selectedBooking.id} · {selectedBooking.plantId}
        </p>
      )}
      {locationError && (
        <p role="alert" className="mt-4 max-w-lg rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {locationError}
        </p>
      )}
      <Button
        className="mt-6 min-h-14 px-8 text-base"
        onClick={beginRemoteCheckin}
        disabled={isCheckingLocation || !selectedBooking}
      >
        <Icon name="map" size={19} />
        {isCheckingLocation ? "กำลังตรวจสอบตำแหน่ง…" : "เริ่ม check-in"}
      </Button>
      <p className="mt-4 max-w-lg text-[11px] leading-5 text-amber-700">
        พิกัดโรงงานในระบบนี้เป็นพิกัดตัวอย่างสำหรับ demo
        กรุณาตั้งค่าพิกัดจริงก่อนใช้งานจริง
      </p>
    </Panel>
  );
}
