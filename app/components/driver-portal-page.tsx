"use client";

import { useState } from "react";
import { CheckinLanding } from "@/app/components/driver/checkin-landing";
import { CompleteStep } from "@/app/components/driver/complete-step";
import { ContactStep } from "@/app/components/driver/contact-step";
import { DriverPassView } from "@/app/components/driver/driver-pass-view";
import { QueueView } from "@/app/components/driver/queue-view";
import { ReviewStep } from "@/app/components/driver/review-step";
import { replacePrimaryPhone } from "@/app/data/driver-checkin";
import { recordCheckin } from "@/app/data/checkin-log";
import { useContactVerification } from "@/app/hooks/use-contact-verification";
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

  const remoteCheckin = useRemoteCheckin(selectedBooking, onProgressChange);
  const verification = useContactVerification({
    checkinBooking,
    contactPhone,
    onProgressChange,
    onVerifyCode,
    onNavigate,
    onRecordCheckin: (booking) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      recordCheckin(
        booking.id,
        booking.retailer,
        booking.broker,
        booking.driver,
        booking.plate,
        booking.date,
        booking.timeSlot,
        timeStr,
        "ระบบเช็คอิน",
      );
    },
  });
  const phoneEditor = usePhoneEditor(contactPhones, onContactPhonesChange);

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

  if (progress.step === "review" && checkinBooking) {
    return (
      <ReviewStep
        booking={checkinBooking}
        driver={driver}
        onBack={() => onProgressChange({ bookingId: null, step: "landing" })}
        onConfirm={() =>
          onProgressChange({ bookingId: checkinBooking.id, step: "contact" })
        }
      />
    );
  }

  if (progress.step === "contact" && checkinBooking) {
    return (
      <ContactStep
        contactPhone={contactPhone}
        verificationCode={verification.verificationCode}
        codeError={verification.codeError}
        onPhoneChange={(phone) =>
          onContactPhonesChange(replacePrimaryPhone(contactPhones, phone))
        }
        onCodeChange={verification.changeVerificationCode}
        onConfirm={verification.confirmContactAndCode}
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
        onCheckinOther={() => onProgressChange({ bookingId: null, step: "landing" })}
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
    />
  );
}
