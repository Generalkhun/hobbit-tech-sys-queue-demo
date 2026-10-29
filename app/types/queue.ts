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
  | "brokers"
  | "booking"
  | "operations"
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
  | "driver-queue";

export type BookingStatus =
  | "confirmed"
  | "waiting"
  | "call-requested"
  | "called"
  | "at-gate"
  | "completed";

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

export interface DriverRecord {
  id: string;
  name: string;
  carrier: string;
  plate: string;
  phone: string;
  employmentType: "employee" | "contractor";
  approved: boolean;
  nationalIdMasked?: string;
  licenseNumber?: string;
  drivingHistory?: string;
}

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
