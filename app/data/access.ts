import type { PageKey, UserRole } from "@/app/types/queue";

const adminPages: PageKey[] = [
  "overview",
  "plans",
  "brokers",
  "booking",
  "operations",
  "security",
  "delivery-notes",
  "operation-notes",
  "queue-check",
  "sellers",
  "shops",
  "drivers",
  "vehicles",
  "provinces",
  "vehicle-types",
  "settings",
];

const partnerPages: PageKey[] = [
  "overview",
  "booking",
  "delivery-notes",
  "queue-check",
  "drivers",
  "vehicles",
];

const operationsPages: PageKey[] = [
  "overview",
  "plans",
  "operations",
  "queue-check",
];

const securityPages: PageKey[] = ["overview", "security", "queue-check"];
const driverPages: PageKey[] = [
  "driver-pass",
  "driver-checkin",
  "driver-queue",
];

export function getAllowedPages(role: UserRole): PageKey[] {
  if (role === "admin") return adminPages;
  if (role === "operations") return operationsPages;
  if (role === "security") return securityPages;
  if (role === "driver") return driverPages;
  return partnerPages;
}

export function canAccessPage(role: UserRole, page: PageKey): boolean {
  return getAllowedPages(role).includes(page);
}
