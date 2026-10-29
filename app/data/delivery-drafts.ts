import { demoDate } from "@/app/data/mocks/demo-date";
import { bookableSlots } from "@/app/data/slot-time";
import type {
  DeliveryDraft,
  DemoUser,
  DriverRecord,
  QueueBooking,
} from "@/app/types/queue";

const DEFAULT_RETAILER_FOR_RETAILER_ROLE = "ร้านสมชายค้าเหล็ก";
const DEFAULT_RETAILER = "ร้านเจริญทรัพย์";
const DEFAULT_BROKER_FOR_BROKER_ROLE = "บริษัท เอส.เอส. เมทัล";

export function canCreateDeliveryNote(user: DemoUser) {
  return user.role !== "security" && user.role !== "operations";
}

export function createDeliveryDraft(
  user: DemoUser,
  drivers: DriverRecord[],
  now: number = Date.now(),
): DeliveryDraft {
  const firstDriver = drivers.find((driver) => driver.approved);
  return {
    id: `DRAFT-${now.toString(36).toUpperCase()}`,
    step: 0,
    retailer:
      user.role === "retailer"
        ? DEFAULT_RETAILER_FOR_RETAILER_ROLE
        : DEFAULT_RETAILER,
    broker: user.role === "broker" ? DEFAULT_BROKER_FOR_BROKER_ROLE : "—",
    grade: "Bundle SY",
    date: demoDate,
    timeSlot: bookableSlots[1],
    heavyWeightKg: "40000",
    lightWeightKg: "12000",
    ticketName: "ใบชั่งต้นทาง_ตัวอย่าง.pdf",
    driverId: "",
    employmentType: "contractor",
    carrier: firstDriver?.carrier ?? "",
    plate: firstDriver?.plate ?? "",
    driver: "",
  };
}

/** ใบนำส่งที่บันทึกแล้วในรูปแบบ draft ขั้นสุดท้าย สำหรับเปิดดูอย่างเดียว */
export function bookingToViewDraft(booking: QueueBooking): DeliveryDraft {
  return {
    id: `view-${booking.id}`,
    step: 2,
    retailer: booking.retailer,
    broker: booking.broker,
    grade: booking.grade,
    date: booking.date,
    timeSlot: booking.timeSlot,
    heavyWeightKg: String(booking.heavyWeightKg),
    lightWeightKg: String(booking.lightWeightKg),
    ticketName: booking.ticketName,
    driverId: "",
    employmentType: "contractor",
    carrier: booking.carrier,
    plate: booking.plate,
    driver: booking.driver,
  };
}
