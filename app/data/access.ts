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

const securityPages: PageKey[] = ["overview", "security", "queue-check"];

export function getAllowedPages(role: UserRole): PageKey[] {
  if (role === "admin") return adminPages;
  if (role === "security") return securityPages;
  return partnerPages;
}

export function canAccessPage(role: UserRole, page: PageKey): boolean {
  return getAllowedPages(role).includes(page);
}
