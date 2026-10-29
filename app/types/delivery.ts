import type { DeliveryDraft, QueueBooking } from "@/app/types/queue";

export type DeliveryListItem =
  | { kind: "draft"; draft: DeliveryDraft }
  | { kind: "booking"; booking: QueueBooking };
