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
import type {
  BookingReceipt,
  BookingStatus,
  DemoUser,
  DriverRecord,
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
  const resolveCapacity = useMemo(
    () => createCapacityResolver(plans, savedConfig),
    [plans, savedConfig],
  );
  const isRushHourReopened = useMemo(
    () => createRushHourOverrideResolver(savedConfig),
    [savedConfig],
  );

  function updateBookingStatus(id: string, status: BookingStatus): string | null {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return "ไม่พบใบนำส่งที่ต้องการเปลี่ยนสถานะ";
    if (!user) return "กรุณาเข้าสู่ระบบก่อนเปลี่ยนสถานะคิว";
    const transitionError = getStatusTransitionError(user.role, booking.status, status);
    if (transitionError) return transitionError;
    setBookings((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    return null;
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
      createdAt: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
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

  return {
    bookings,
    plans,
    receipts,
    resolveCapacity,
    isRushHourReopened,
    updateBookingStatus,
    updateReceipt,
    createBooking,
    moveBooking,
  };
}
