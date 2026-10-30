import type { DriverRecord } from "@/app/types/registry";
export type UserRole =
  | "admin"
  | "operations"
  | "broker"
  | "retailer"
  | "security"
  | "driver";

export type PageKey =
  | "overview"
  | "plans"
  | "booking"
  | "operations"
  | "operations-history"
  | "security"
  | "delivery-notes"
  | "operation-notes"
  | "queue-check"
  | "sellers"
  | "shops"
  | "drivers"
  | "vehicles"
  | "provinces"
  | "vehicle-types"
  | "settings"
  | "driver-pass"
  | "driver-checkin"
  | "driver-queue"
  | "fastlane-rules"
  | "policy-documents"
  | "shop-profile"
  | "seller-profile"
  | "acknowledgements";

export type BookingStatus =
  | "confirmed"
  | "waiting"
  | "checked-in"
  | "at-gate"
  | "call-requested"
  | "called"
  | "no-answer"
  | "completed";

/** จำนวนครั้งที่โทรแล้วไม่รับ — เก็บต่อ booking (key: bookingId) */
export type NoAnswerCounts = Record<string, number>;

/** เวลาเช็คอินของรถ (key: bookingId) */
export type CheckinTimes = Record<string, string>;

export interface DemoUser {
  id: string;
  name: string;
  organization: string;
  role: UserRole;
  initials: string;
  driverId?: string;
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  dailyCapacity: number;
  reservedTons: number;
  activeQueues: number;
  latitude: number;
  longitude: number;
}

export interface QueueBooking {
  id: string;
  retailer: string;
  broker: string;
  plantId: string;
  grade: string;
  heavyWeightKg: number;
  lightWeightKg: number;
  estimatedTons: number;
  date: string;
  timeSlot: string;
  driver: string;
  carrier: string;
  plate: string;
  /** จังหวัดทะเบียนรถ — ร่วมกับทะเบียนเป็น id รถ (ทะเบียนซ้ำกันได้ข้ามจังหวัด) */
  province?: string;
  status: BookingStatus;
  ticketName: string;
  createdAt: string;
  schedulingReason?: string;
}

export interface BookingReceipt {
  state: "pending" | "received" | "no-show";
  receivedDate: string;
  receivedKg: number;
}

export interface DeliveryDraft {
  id: string;
  step: 0 | 1 | 2;
  retailer: string;
  broker: string;
  grade: string;
  date: string;
  timeSlot: string;
  heavyWeightKg: string;
  lightWeightKg: string;
  ticketName: string;
  driverId: string;
  employmentType: DriverRecord["employmentType"];
  carrier: string;
  plate: string;
  /** จังหวัดทะเบียน — ใช้ร่วมกับทะเบียนเป็น id รถ (ทะเบียนซ้ำกันได้ข้ามจังหวัด) */
  province: string;
  driver: string;
}

export interface BlacklistRecord {
  id: string;
  targetType: "driver" | "vehicle";
  targetId: string;
  displayName: string;
  reason: string;
}

export interface PolicyAcknowledgement {
  shopName: string;
  documentType: "privacy-notice" | "personal-data-use";
  policyVersion: string;
  acknowledgedAt: string;
  acknowledgedBy: string;
}

/** สถานะ RP สำหรับผู้ขายและร้านค้า */
export type RPStatus = "fastlane" | "normal" | "limited";

/** กฎสำหรับการปรับ RP status */
export interface FastlaneRule {
  id: string;
  /** จำนวนครั้งที่ต้องจองแล้วมาตามนัด */
  consecutiveOnTimeThreshold: number;
  /** จำนวนครั้งที่เบี้ยว (no-show) ที่จะถูกปรับเป็น limited */
  noShowLimit: number;
  /** จำนวนครั้งที่สายที่ยังยอมรับได้ */
  lateTolerance: number;
  updatedAt: string;
  updatedBy: string;
}

/** บันทึกการเช็คอินของรถ */
export interface CheckinLog {
  id: string;
  bookingId: string;
  shopName: string;
  sellerName: string;
  driverName: string;
  plate: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  checkinTime: string;
  /** "on-time" | "late" | "no-show" */
  status: "on-time" | "late" | "no-show";
  lateMinutes: number;
  recordedBy: string;
  recordedAt: string;
}

/** เอกสารที่ต้องรับทราบ (นโยบาย, PDPA ฯลฯ) */
export interface PolicyDocument {
  id: string;
  title: string;
  description: string;
  documentType: string;
  version: string;
  /** "shop" | "seller" | "all" */
  targetAudience: "shop" | "seller" | "all";
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  active: boolean;
}

/** สถานะการรับทราบเอกสารของผู้ใช้ */
export interface DocumentAcknowledgement {
  id: string;
  documentId: string;
  targetType: "shop" | "seller";
  targetId: string;
  targetName: string;
  /** "unread" | "read" | "acknowledged" */
  status: "unread" | "read" | "acknowledged";
  readAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export type { DriverRecord } from "@/app/types/registry";

export interface DriverCheckinProgress {
  bookingId: string | null;
  step: "landing" | "review" | "contact" | "complete";
}

export interface PlanRow {
  id: string;
  plantId: string;
  grade: string;
  dailyLimit: number;
  reserved: number;
  slotsOpen: number;
  window: string;
  maxVehiclesPerSlot: number;
}
