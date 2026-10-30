import type {
  BlacklistRecord,
  DeliveryDraft,
  DemoUser,
  DriverRecord,
  PlanRow,
  PolicyAcknowledgement,
  QueueBooking,
} from "@/app/types/queue";
import type { CapacityResolver } from "@/app/data/slot-capacity";
import type { RushHourOverrideResolver } from "@/app/data/slot-capacity";
import type { VehicleRecord, RegistryStatus } from "@/app/types/registry";
import type { Seller, SellerShop } from "@/app/types/seller";

export type NewBooking = Omit<
  QueueBooking,
  "id" | "createdAt" | "status" | "plantId"
>;
export type EmploymentType = DriverRecord["employmentType"];
export type BookingStep = 0 | 1 | 2 | 3;
export type EditableStep = 0 | 1 | 2;

/** ขอบข่ายรถยนต์ที่ผู้สร้างใบนำส่งมองเห็นได้ */
export type VehicleScope =
  | { kind: "admin" }
  | { kind: "broker"; sellerId: string | null }
  | { kind: "retailer"; shopName: string | null };

export interface BookingCreationResult {
  booking?: QueueBooking;
  error?: string;
}

/** รถยนต์ที่โชว์ในขั้นตอนเลือกรถยนต์ โดยรวมข้อมูลทะเบียนรถ + คนขับที่ผูกกับรถ */
export interface DeliveryVehicle {
  key: string;
  id: string;
  carrier: string;
  plate: string;
  vehicleType: string;
  province: string;
  ownerType: VehicleRecord["ownerType"];
  shopName: string;
  status: RegistryStatus;
  drivers: DriverRecord[];
}

export interface DeliveryFormValues {
  retailer: string;
  broker: string;
  grade: string;
  date: string;
  timeSlot: string;
  heavyWeightKg: string;
  lightWeightKg: string;
  ticketName: string;
}

export interface BookingPageProps {
  user: DemoUser;
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  sellers: Seller[];
  shops: SellerShop[];
  blacklist: BlacklistRecord[];
  plans: PlanRow[];
  bookings: QueueBooking[];
  resolveCapacity: CapacityResolver;
  isRushHourReopened: RushHourOverrideResolver;
  acknowledgements: PolicyAcknowledgement[];
  onCreate: (booking: NewBooking) => BookingCreationResult;
  onGoToRegistry: () => void;
  onViewVehicle: (vehicleId: string) => void;
  onAcknowledgePolicies: (shopName: string) => boolean;
  draft: DeliveryDraft;
  viewBooking?: QueueBooking;
  onDraftChange: (draft: DeliveryDraft) => void;
  onCompleteDraft: (draftId: string) => void;
  onReturnToList: () => void;
  verificationCodes: Record<string, string>;
  onGenerateVerificationCode: (bookingId: string) => string | null;
}
