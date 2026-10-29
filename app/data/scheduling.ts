import type { PlanRow, QueueBooking } from "@/app/types/queue";
import {
  createCapacityResolver,
  type CapacityResolver,
} from "./slot-capacity.ts";
import { isSlotInsideWindow, overlapsRushHour } from "./slot-time.ts";

export interface SchedulingRequest {
  date: string;
  timeSlot: string;
  grade: string;
  estimatedTons: number;
}

export interface PlantScheduleOption {
  plantId: string;
  bookedVehicles: number;
  maxVehicles: number;
  remainingVehicles: number;
  gradeShortageTons: number;
  fulfilledShortageTons: number;
}

export interface ScheduleDecision {
  plantId: string;
  reason: string;
  options: PlantScheduleOption[];
}

export type ScheduleResult =
  | { available: true; decision: ScheduleDecision }
  | { available: false; reason: string; options: PlantScheduleOption[] };

function countVehiclesAtSlot(
  bookings: QueueBooking[],
  plantId: string,
  request: SchedulingRequest,
  excludeBookingId?: string,
) {
  return bookings.filter(
    (booking) =>
      booking.id !== excludeBookingId &&
      booking.plantId === plantId &&
      booking.grade === request.grade &&
      booking.date === request.date &&
      booking.timeSlot === request.timeSlot,
  ).length;
}

export function getPlantScheduleOptions(
  request: SchedulingRequest,
  plans: PlanRow[],
  bookings: QueueBooking[],
  excludeBookingId?: string,
  resolveCapacity: CapacityResolver = createCapacityResolver(plans),
): PlantScheduleOption[] {
  return plans
    .filter(
      (plan) =>
        plan.grade === request.grade &&
        isSlotInsideWindow(request.timeSlot, plan.window) &&
        !overlapsRushHour(plan.plantId, request.timeSlot),
    )
    .map((plan) => {
      const bookedVehicles = countVehiclesAtSlot(
        bookings,
        plan.plantId,
        request,
        excludeBookingId,
      );
      const maxVehicles = resolveCapacity(
        plan.plantId,
        request.date,
        request.timeSlot,
        request.grade,
      );
      const gradeShortageTons = Math.max(0, plan.dailyLimit - plan.reserved);
      return {
        plantId: plan.plantId,
        bookedVehicles,
        maxVehicles,
        remainingVehicles: Math.max(0, maxVehicles - bookedVehicles),
        gradeShortageTons,
        fulfilledShortageTons: Math.min(
          request.estimatedTons,
          gradeShortageTons,
        ),
      };
    });
}

export function schedulePlant(
  request: SchedulingRequest,
  plans: PlanRow[],
  bookings: QueueBooking[],
  resolveCapacity: CapacityResolver = createCapacityResolver(plans),
): ScheduleResult {
  if (!Number.isFinite(request.estimatedTons) || request.estimatedTons <= 0) {
    return {
      available: false,
      reason: "ปริมาณเศษเหล็กต้องมากกว่าศูนย์ตัน",
      options: [],
    };
  }
  const options = getPlantScheduleOptions(
    request,
    plans,
    bookings,
    undefined,
    resolveCapacity,
  );
  const available = options.filter((option) => option.remainingVehicles > 0);

  if (available.length === 0) {
    if (options.length === 0) {
      const hasGradePlan = plans.some((plan) => plan.grade === request.grade);
      const blockedPlants = plans
        .filter(
          (plan) =>
            plan.grade === request.grade &&
            isSlotInsideWindow(request.timeSlot, plan.window) &&
            overlapsRushHour(plan.plantId, request.timeSlot),
        )
        .map((plan) => plan.plantId);
      return {
        available: false,
        reason: blockedPlants.length > 0
          ? `ช่วง ${request.timeSlot} ทับช่วง rush hour ของ ${blockedPlants.join(", ")}`
          : hasGradePlan
          ? `ไม่มีโรงงานเปิดรับเกรด ${request.grade} ในช่วง ${request.timeSlot}`
          : `ไม่มีแผนรับเกรด ${request.grade} สำหรับวันที่และช่วงเวลาที่เลือก`,
        options,
      };
    }

    return {
      available: false,
      reason: `คิวช่วง ${request.timeSlot} เต็มทุกโรงงานแล้ว กรุณาเลือกช่วงเวลาอื่น`,
      options,
    };
  }

  available.sort(
    (left, right) =>
      left.bookedVehicles - right.bookedVehicles ||
      right.fulfilledShortageTons - left.fulfilledShortageTons ||
      right.gradeShortageTons - left.gradeShortageTons ||
      left.plantId.localeCompare(right.plantId),
  );

  const selected = available[0];
  const competing = available.filter(
    (option) => option.bookedVehicles === selected.bookedVehicles,
  );
  const reason =
    competing.length === 1
      ? `${selected.plantId} ยังมี ${selected.remainingVehicles}/${selected.maxVehicles} คิวว่างใน slot นี้`
      : `กระจายคิวโดยเลือกโรงงานที่มีรถใน slot น้อยกว่า (${selected.plantId}: ${selected.bookedVehicles} คัน); ${selected.plantId} ยังขาดเกรด ${request.grade} อีก ${selected.gradeShortageTons} ตัน จึงจัดลำดับรถ ${request.estimatedTons} ตันให้โรงงานนี้`;

  return {
    available: true,
    decision: {
      plantId: selected.plantId,
      reason,
      options,
    },
  };
}

export function canMoveBookingToPlant(
  booking: QueueBooking,
  targetPlantId: string,
  plans: PlanRow[],
  bookings: QueueBooking[],
  resolveCapacity: CapacityResolver = createCapacityResolver(plans),
): ScheduleResult {
  if (booking.plantId === targetPlantId) {
    return {
      available: false,
      reason: `รถคันนี้อยู่ที่โรงงาน ${targetPlantId} อยู่แล้ว`,
      options: getPlantScheduleOptions(
        {
          date: booking.date,
          timeSlot: booking.timeSlot,
          grade: booking.grade,
          estimatedTons: booking.estimatedTons,
        },
        plans,
        bookings,
        booking.id,
        resolveCapacity,
      ),
    };
  }
  const request: SchedulingRequest = {
    date: booking.date,
    timeSlot: booking.timeSlot,
    grade: booking.grade,
    estimatedTons: booking.estimatedTons,
  };
  const options = getPlantScheduleOptions(
    request,
    plans,
    bookings,
    booking.id,
    resolveCapacity,
  );
  const target = options.find((option) => option.plantId === targetPlantId);

  if (!target) {
    return {
      available: false,
      reason: `โรงงาน ${targetPlantId} ไม่มีแผนรับเกรด ${booking.grade}`,
      options,
    };
  }
  if (target.remainingVehicles === 0) {
    return {
      available: false,
      reason: `คิวช่วง ${booking.timeSlot} ของโรงงาน ${targetPlantId} เต็มแล้ว`,
      options,
    };
  }

  return {
    available: true,
    decision: {
      plantId: targetPlantId,
      reason: `โยกโดยทีม ปศ. · ${targetPlantId} ยังมี ${target.remainingVehicles}/${target.maxVehicles} คิวว่างใน slot นี้`,
      options,
    },
  };
}
