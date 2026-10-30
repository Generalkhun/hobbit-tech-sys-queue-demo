"use client";

import { useMemo, useState } from "react";
import { getBlacklistReason, hasCurrentPolicyAcknowledgement } from "@/app/data/eligibility";
import { mockBlacklist, mockBookings, mockPlans, policyVersion } from "@/app/data/mock-data";
import { canMoveBookingToPlant, schedulePlant } from "@/app/data/scheduling";
import {
  createCapacityResolver,
  createRushHourOverrideResolver,
  type SlotCapacityConfig,
} from "@/app/data/slot-capacity";
import { getStatusTransitionError } from "@/app/data/workflow";
import { isDriverApproved } from "@/app/data/registry";
import { addOpsLog, createOpsLog } from "@/app/data/ops-log";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  BookingReceipt,
  BookingStatus,
  CheckinTimes,
  DemoUser,
  DriverRecord,
  NoAnswerCounts,
  PolicyAcknowledgement,
  QueueBooking,
} from "@/app/types/queue";

export type NewBookingInput = Omit<
  QueueBooking,
  "id" | "createdAt" | "status" | "plantId"
>;

export interface BookingCreationResult {
  booking?: QueueBooking;
  error?: string;
}

interface Dependencies {
  user: DemoUser | null;
  drivers: DriverRecord[];
  savedConfig: SlotCapacityConfig;
  acknowledgements: PolicyAcknowledgement[];
  getSellerBlock: (retailer: string, broker: string) => string | null;
}

export function useQueueBookings({
  user,
  drivers,
  savedConfig,
  acknowledgements,
  getSellerBlock,
}: Dependencies) {
  const [bookings, setBookings] = useState<QueueBooking[]>(mockBookings);
  const [plans, setPlans] = useState(mockPlans);
  const [receipts, setReceipts] = useState<Record<string, BookingReceipt>>({});
  const [checkinTimes, setCheckinTimes] = useState<CheckinTimes>({});
  const [noAnswerCounts, setNoAnswerCounts] = useState<NoAnswerCounts>({});
  const resolveCapacity = useMemo(
    () => createCapacityResolver(plans, savedConfig),
    [plans, savedConfig],
  );
  const isRushHourReopened = useMemo(
    () => createRushHourOverrideResolver(savedConfig),
    [savedConfig],
  );

  function nowIso() {
    return new Date().toISOString();
  }

  function nowTime() {
    return new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /** บันทึก log ทุกครั้งที่เปลี่ยนสถานะใน pipeline */
  function logTransition(
    booking: QueueBooking,
    from: BookingStatus,
    to: BookingStatus,
    actionLabel: string,
    value: NoteWithAttachments,
  ) {
    addOpsLog(
      createOpsLog({
        booking,
        from,
        to,
        actionLabel,
        note: value.note,
        attachments: value.attachments,
        actor: user?.name ?? "ระบบ",
        at: nowIso(),
      }),
    );
  }

  /** เปลี่ยนสถานะพร้อมหมายเหตุ/รูป (action ทุกครั้งจากหน้า ปศ.) ลง log ด้วย */
  function transitionBooking(
    id: string,
    to: BookingStatus,
    value: NoteWithAttachments = { note: "", attachments: [] },
    actionLabel = "",
  ): string | null {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return "ไม่พบใบนำส่งที่ต้องการเปลี่ยนสถานะ";
    if (!user) return "กรุณาเข้าสู่ระบบก่อนเปลี่ยนสถานะคิว";
    const transitionError = getStatusTransitionError(user.role, booking.status, to);
    if (transitionError) return transitionError;
    const label =
      actionLabel ||
      ({
        "checked-in": "รถเช็คอินแล้ว",
        "at-gate": "จัดคิวแล้ว",
        "call-requested": "ปศ. แจ้ง รปภ. ให้โทรเรียกรถ",
        called: "รปภ. โทรเรียกแล้ว",
        "no-answer": "รปภ. โทรแล้วไม่รับ",
        confirmed: "ยืนยันแล้ว",
        waiting: "รอเรียกคิว",
        completed: "รถผ่านป้อมแล้ว",
      } as Partial<Record<BookingStatus, string>>)[to] ||
      to;
    setBookings((current) =>
      current.map((item) => (item.id === id ? { ...item, status: to } : item)),
    );
    logTransition(booking, booking.status, to, label, value);
    return null;
  }

  /** บันทึกการเช็คอิน (online หรือ รปภ.) พร้อมเวลาจริง ตรวจสอบสาย */
  function recordCheckinForBooking(
    id: string,
    atTime: string,
    value: NoteWithAttachments = { note: "", attachments: [] },
  ): { error?: string; lateMinutes: number } {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return { error: "ไม่พบใบนำส่ง", lateMinutes: 0 };
    if (
      booking.status !== "confirmed" &&
      booking.status !== "waiting" &&
      booking.status !== "at-gate"
    ) {
      return { error: "ใบนำส่งนี้ไม่สามารถเช็คอินได้ในสถานะปัจจุบัน", lateMinutes: 0 };
    }
    const lateMinutes = computeLateMinutes(booking.timeSlot, atTime);
    const label =
      lateMinutes >= 10
        ? `เช็คอินสาย ${lateMinutes} นาที (นัด ${booking.timeSlot})`
        : `เช็คอินแล้ว · ตรงเวลา (นัด ${booking.timeSlot})`;
    setCheckinTimes((current) => ({ ...current, [id]: atTime }));
    setBookings((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "checked-in" } : item)),
    );
    logTransition(booking, booking.status, "checked-in", label, value);
    return { lateMinutes };
  }

  /** รปภ. โทรเรียกรถแล้วไม่รับ — นับครั้ง เพิ่มสถานะ no-answer */
  function markNoAnswer(
    id: string,
    value: NoteWithAttachments = { note: "", attachments: [] },
  ): { error?: string; count: number } {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return { error: "ไม่พบใบนำส่ง", count: 0 };
    if (booking.status !== "call-requested") {
      return { error: "รถต้องอยู่ในสถานะ ปศ. แจ้ง รปภ. แล้ว ก่อนโทรไม่รับ", count: 0 };
    }
    const count = (noAnswerCounts[id] ?? 0) + 1;
    setNoAnswerCounts((current) => ({ ...current, [id]: count }));
    setBookings((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "no-answer" } : item)),
    );
    logTransition(
      booking,
      booking.status,
      "no-answer",
      `รปภ. โทรแล้วไม่รับ (ครั้งที่ ${count})`,
      value,
    );
    return { count };
  }

  function updateReceipt(bookingId: string, receipt: BookingReceipt) {
    setReceipts((current) => ({ ...current, [bookingId]: receipt }));
  }

  function createBooking(input: NewBookingInput): BookingCreationResult {
    if (!hasCurrentPolicyAcknowledgement(input.retailer, policyVersion, acknowledgements)) {
      return { error: "ร้านค้ายังไม่ได้รับทราบนโยบาย PDPA ฉบับปัจจุบัน" };
    }
    const selectedDriver = drivers.find(
      (driver) =>
        driver.name === input.driver &&
        driver.plate === input.plate &&
        driver.carrier === input.carrier,
    );
    if (!selectedDriver) return { error: "ไม่พบผู้ขับและรถที่เลือกในทะเบียน" };
    if (!isDriverApproved(selectedDriver)) return { error: "ผู้ขับหรือรถยังไม่ได้รับการอนุมัติ" };
    const blacklistReasons = getBlacklistReason(selectedDriver.id, input.plate, mockBlacklist);
    if (blacklistReasons.length > 0) {
      return { error: `ไม่สามารถสร้างใบนำส่งได้: ${blacklistReasons.join(" · ")}` };
    }
    const sellerBlock = getSellerBlock(input.retailer, input.broker);
    if (sellerBlock) return { error: sellerBlock };
    const schedule = schedulePlant(
      {
        date: input.date,
        timeSlot: input.timeSlot,
        grade: input.grade,
        estimatedTons: input.estimatedTons,
      },
      plans,
      bookings,
      resolveCapacity,
      isRushHourReopened,
    );
    if (!schedule.available) return { error: schedule.reason };

    const datePart = input.date.replaceAll("-", "").slice(2);
    const nextBooking: QueueBooking = {
      ...input,
      plantId: schedule.decision.plantId,
      schedulingReason: schedule.decision.reason,
      id: `SC${datePart}${String(bookings.length + 1).padStart(2, "0")}`,
      createdAt: nowTime(),
      status: "confirmed",
    };
    setBookings((current) => [nextBooking, ...current]);
    setPlans((current) =>
      current.map((plan) =>
        plan.plantId === nextBooking.plantId && plan.grade === nextBooking.grade
          ? { ...plan, reserved: plan.reserved + nextBooking.estimatedTons }
          : plan,
      ),
    );
    return { booking: nextBooking };
  }

  function moveBooking(bookingId: string, targetPlantId: string): string | null {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return "ไม่พบใบนำส่งที่ต้องการโยกโรงงาน";
    if (booking.plantId === targetPlantId) {
      return "รถคันนี้อยู่ที่โรงงานปลายทางดังกล่าวแล้ว";
    }
    if (booking.status === "completed") {
      return "ไม่สามารถโยกรายการที่ผ่านป้อม รปภ. แล้ว";
    }
    const result = canMoveBookingToPlant(
      booking,
      targetPlantId,
      plans,
      bookings,
      resolveCapacity,
      isRushHourReopened,
    );
    if (!result.available) return result.reason;

    setBookings((current) =>
      current.map((item) =>
        item.id === bookingId
          ? { ...item, plantId: targetPlantId, schedulingReason: result.decision.reason }
          : item,
      ),
    );
    setPlans((current) =>
      current.map((plan) => {
        if (plan.plantId === booking.plantId && plan.grade === booking.grade) {
          return { ...plan, reserved: Math.max(0, plan.reserved - booking.estimatedTons) };
        }
        if (plan.plantId === targetPlantId && plan.grade === booking.grade) {
          return { ...plan, reserved: plan.reserved + booking.estimatedTons };
        }
        return plan;
      }),
    );
    return null;
  }

  /** ดั้งเดิม: เปลี่ยนสถานะโดยไม่มี note (เก็บไว้ compatibility) */
  function updateBookingStatus(id: string, status: BookingStatus): string | null {
    return transitionBooking(id, status);
  }

  return {
    bookings,
    plans,
    receipts,
    checkinTimes,
    noAnswerCounts,
    resolveCapacity,
    isRushHourReopened,
    updateBookingStatus,
    transitionBooking,
    recordCheckinForBooking,
    markNoAnswer,
    updateReceipt,
    createBooking,
    moveBooking,
  };
}

/** คำนวณความสาย: เวลาเช็คอิน เทียบกับเวลานัดหมายของ slot (นับเฉพาะเกิน 10 นาที) */
export function computeLateMinutes(timeSlot: string, checkinTime: string) {
  const [slotHour] = timeSlot.split(":").map(Number);
  const [hour, minute] = checkinTime.split(":").map(Number);
  if (Number.isNaN(slotHour) || Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  const scheduled = slotHour * 60;
  const actual = hour * 60 + minute;
  return Math.max(0, actual - scheduled);
}
