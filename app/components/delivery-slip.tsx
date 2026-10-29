"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@/app/components/icons";
import { Button, Panel, StatusBadge } from "@/app/components/ui";
import type { QueueBooking } from "@/app/types/queue";

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

export function DeliverySlip({
  booking,
  verificationCode,
  onGenerateVerificationCode,
  showVerificationSection = true,
  showPrintButton = true,
  showStatusBadge = true,
}: {
  booking: QueueBooking;
  verificationCode?: string;
  onGenerateVerificationCode: (bookingId: string) => string | null;
  showVerificationSection?: boolean;
  showPrintButton?: boolean;
  showStatusBadge?: boolean;
}) {
  const [codeGenerationError, setCodeGenerationError] = useState("");
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
    ["ชั่งหนัก", `${booking.heavyWeightKg.toLocaleString("th-TH")} กก.`],
    ["ชั่งเบา", `${booking.lightWeightKg.toLocaleString("th-TH")} กก.`],
    [
      "น้ำหนักสุทธิ",
      `${(booking.heavyWeightKg - booking.lightWeightKg).toLocaleString("th-TH")} กก.`,
    ],
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
        {showStatusBadge && <StatusBadge status={booking.status} />}
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
        {showPrintButton && (
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              <Icon name="document" size={15} />
              พิมพ์ใบนำส่ง
            </Button>
          </div>
        )}
      </div>
      {showVerificationSection && (
        <div className="border-t border-slate-100 px-5 py-5 sm:px-7">
          <h3 className="text-sm font-bold text-sys-900">
            รหัสยืนยันตัวตนคนขับ
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            สร้างรหัส 6 หลักเพื่อแจ้งให้คนขับใช้ยืนยันตัวตนตอนเช็คอิน online
          </p>
          {verificationCode ? (
            <p className="mt-3 inline-flex rounded-xl bg-sys-50 px-4 py-3 font-mono text-2xl font-bold tracking-[0.3em] text-sys-800">
              {verificationCode}
            </p>
          ) : (
            <Button
              type="button"
              className="mt-3"
              onClick={() => {
                const error = onGenerateVerificationCode(booking.id);
                setCodeGenerationError(error ?? "");
              }}
            >
              สร้างรหัส 6 หลัก
            </Button>
          )}
          {codeGenerationError && (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              {codeGenerationError}
            </p>
          )}
          <p className="mt-2 text-[11px] text-amber-700">
            รหัสสำหรับ demo จัดเก็บในหน่วยความจำของแอปเท่านั้น
          </p>
        </div>
      )}
    </Panel>
  );
}
