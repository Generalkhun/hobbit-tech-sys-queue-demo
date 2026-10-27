export type UserRole = "admin" | "broker" | "retailer" | "security";

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
  | "settings";

export type BookingStatus =
  | "confirmed"
  | "waiting"
  | "called"
  | "at-gate"
  | "completed";

export interface DemoUser {
  id: string;
  name: string;
  organization: string;
  role: UserRole;
  initials: string;
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  dailyCapacity: number;
  reservedTons: number;
  activeQueues: number;
}

export interface QueueBooking {
  id: string;
  retailer: string;
  broker: string;
  plantId: string;
  grade: string;
  estimatedTons: number;
  date: string;
  timeSlot: string;
  driver: string;
  carrier: string;
  plate: string;
  status: BookingStatus;
  ticketName: string;
  createdAt: string;
}

export interface DriverRecord {
  id: string;
  name: string;
  carrier: string;
  plate: string;
  phone: string;
  employmentType: "employee" | "contractor";
  approved: boolean;
}

export interface PlanRow {
  id: string;
  plantId: string;
  grade: string;
  dailyLimit: number;
  reserved: number;
  slotsOpen: number;
  window: string;
}
