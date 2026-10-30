import type { PageKey, UserRole } from "@/app/types/queue";

const adminPages: PageKey[] = [
  "overview",
  "plans",
  "booking",
  "operations",
  "operations-history",
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
  "fastlane-rules",
  "policy-documents",
  "acknowledgements",
];

const partnerPages: PageKey[] = [
  "booking",
  "delivery-notes",
  "queue-check",
  "drivers",
  "vehicles",
  "shop-profile",
  "seller-profile",
  "acknowledgements",
];

const operationsPages: PageKey[] = [
  "plans",
  "operations",
  "operations-history",
  "queue-check",
];

const securityPages: PageKey[] = ["security", "queue-check"];
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
