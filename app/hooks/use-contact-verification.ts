import { useState } from "react";
import { isValidPhone, isValidVerificationCode } from "@/app/data/driver-checkin";
import { recordCheckin } from "@/app/data/checkin-log";
import type {
  DriverCheckinProgress,
  PageKey,
  QueueBooking,
} from "@/app/types/queue";

export function useContactVerification({
  checkinBooking,
  contactPhone,
  onProgressChange,
  onVerifyCode,
  onNavigate,
  onRecordCheckin,
}: {
  checkinBooking: QueueBooking | undefined;
  contactPhone: string;
  onProgressChange: (progress: DriverCheckinProgress) => void;
  onVerifyCode: (bookingId: string, code: string) => string | null;
  onNavigate: (page: PageKey) => void;
  onRecordCheckin?: (booking: QueueBooking) => void;
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");

  function changeVerificationCode(value: string): void {
    setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
    setCodeError("");
  }

  function confirmContactAndCode(): void {
    if (!checkinBooking) return;
    if (!isValidPhone(contactPhone)) {
      setCodeError("กรุณากรอกเบอร์โทรศัพท์ติดต่อให้ถูกต้อง");
      return;
    }
    if (!isValidVerificationCode(verificationCode)) {
      setCodeError("กรุณากรอกรหัสยืนยัน 6 หลัก");
      return;
    }
    const error = onVerifyCode(checkinBooking.id, verificationCode);
    if (error) {
      setCodeError(error);
      return;
    }
    setCodeError("");
    onRecordCheckin?.(checkinBooking);
    onProgressChange({ bookingId: checkinBooking.id, step: "complete" });
    onNavigate("driver-queue");
  }

  return { verificationCode, codeError, changeVerificationCode, confirmContactAndCode };
}
