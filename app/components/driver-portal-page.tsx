"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckinLanding } from "@/app/components/driver/checkin-landing";
import { CompleteStep } from "@/app/components/driver/complete-step";
import { DriverPassView } from "@/app/components/driver/driver-pass-view";
import { QueueView } from "@/app/components/driver/queue-view";
import { recordCheckin } from "@/app/data/checkin-log";
import { usePhoneEditor } from "@/app/hooks/use-phone-editor";
import { useRemoteCheckin } from "@/app/hooks/use-remote-checkin";
import type {
  DriverCheckinProgress,
  DriverRecord,
  PageKey,
  QueueBooking,
} from "@/app/types/queue";

export function DriverPortalPage({
  page,
  driver,
  bookings,
  linkBookingId,
  progress,
  contactPhones,
  onProgressChange,
  onContactPhonesChange,
  onNavigate,
  onRecordOnlineCheckin,
}: {
  page: PageKey;
  driver: DriverRecord;
  bookings: QueueBooking[];
  /** เจาะจงงานเดียวจากลิงก์เช็คอิน (ไม่ต้องเลือกรายการ) */
  linkBookingId?: string;
  progress: DriverCheckinProgress;
  contactPhones: string[];
  onProgressChange: (progress: DriverCheckinProgress) => void;
  onContactPhonesChange: (phones: string[]) => void;
  onNavigate: (page: PageKey) => void;
  /** บันทึกการเช็คอิน online ลง booking/log เมื่อคนขับเช็คอินผ่านลิงก์ */
  onRecordOnlineCheckin?: (bookingId: string, atTime: string) => void;
}) {
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const recordedRef = useRef(false);
  const contactPhone = contactPhones[0] ?? "";

  const linkBooking = linkBookingId
    ? bookings.find((booking) => booking.id === linkBookingId)
    : undefined;

  const assignedBookings = useMemo(() => {
    if (linkBooking) return [linkBooking];
    return bookings.filter((booking) => booking.driver === driver.name);
  }, [bookings, linkBooking, driver.name]);

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

  const remoteCheckin = useRemoteCheckin(selectedBooking, onProgressChange);
  const phoneEditor = usePhoneEditor(contactPhones, onContactPhonesChange);

  // เมื่อเช็คอิน online ผ่าน (link mode ไม่ต้องกรอกรหัส) ให้บันทึก log
  useEffect(() => {
    if (progress.step === "complete" && checkinBooking && !recordedRef.current) {
      recordedRef.current = true;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
      recordCheckin(
        checkinBooking.id,
        checkinBooking.retailer,
        checkinBooking.broker,
        checkinBooking.driver,
        checkinBooking.plate,
        checkinBooking.date,
        checkinBooking.timeSlot,
        timeStr,
        "ระบบเช็คอิน (ลิงก์)",
      );
      // อัปเดตสถานะใบนำส่งเป็น "เช็คอินแล้ว" (รอจัดคิว) ผ่าน callback
      onRecordOnlineCheckin?.(checkinBooking.id, timeStr);
    }
  }, [progress.step, checkinBooking]);

  if (page === "driver-pass") {
    return <DriverPassView booking={checkinBooking} />;
  }

  if (page === "driver-queue") {
    return (
      <QueueView
        progress={progress}
        checkinBooking={checkinBooking}
        contactPhones={contactPhones}
        phoneEditor={phoneEditor}
        onOpenCheckin={() => onNavigate("driver-checkin")}
      />
    );
  }

  if (progress.step === "complete") {
    return (
      <CompleteStep
        contactPhone={contactPhone}
        hasOtherActiveBooking={activeBookings.some(
          (booking) => booking.id !== checkinBooking?.id,
        )}
        onOpenQueue={() => onNavigate("driver-queue")}
        onCheckinOther={() =>
          onProgressChange({ bookingId: null, step: "landing" })
        }
      />
    );
  }

  return (
    <CheckinLanding
      activeBookings={activeBookings}
      selectedBooking={selectedBooking}
      locationError={remoteCheckin.locationError}
      isCheckingLocation={remoteCheckin.isCheckingLocation}
      onSelectBooking={(bookingId) => {
        setSelectedBookingId(bookingId);
        onProgressChange({ bookingId, step: "landing" });
      }}
      onBegin={remoteCheckin.beginRemoteCheckin}
      linkMode={Boolean(linkBookingId)}
    />
  );
}
