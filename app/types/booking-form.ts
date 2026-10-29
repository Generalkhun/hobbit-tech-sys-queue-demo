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

export type NewBooking = Omit<
  QueueBooking,
  "id" | "createdAt" | "status" | "plantId"
>;
export type EmploymentType = DriverRecord["employmentType"];
export type BookingStep = 0 | 1 | 2 | 3;
export type EditableStep = 0 | 1 | 2;

export interface BookingCreationResult {
  booking?: QueueBooking;
  error?: string;
}

export interface DeliveryVehicle {
  key: string;
  carrier: string;
  plate: string;
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
  blacklist: BlacklistRecord[];
  plans: PlanRow[];
  bookings: QueueBooking[];
  resolveCapacity: CapacityResolver;
  acknowledgements: PolicyAcknowledgement[];
  onCreate: (booking: NewBooking) => BookingCreationResult;
  onGoToRegistry: () => void;
  onAcknowledgePolicies: (shopName: string) => boolean;
  draft: DeliveryDraft;
  viewBooking?: QueueBooking;
  onDraftChange: (draft: DeliveryDraft) => void;
  onCompleteDraft: (draftId: string) => void;
  onReturnToList: () => void;
  verificationCodes: Record<string, string>;
  onGenerateVerificationCode: (bookingId: string) => string | null;
}
