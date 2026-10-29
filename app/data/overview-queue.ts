import type { DemoUser, PageKey } from "@/app/types/queue";

export function canManagePlans(user: DemoUser) {
  return user.role === "admin" || user.role === "operations";
}

/** ปลายทางและข้อความของปุ่มไปหน้าคิวบนแดชบอร์ด ตามบทบาท */
export function getQueueShortcut(user: DemoUser): {
  page: PageKey;
  label: string;
} {
  if (user.role === "security") return { page: "security", label: "ไปสถานี รปภ." };
  if (canManagePlans(user)) return { page: "operations", label: "ไปหน้าปฏิบัติการ" };
  return { page: "delivery-notes", label: "ดูใบนำส่ง" };
}
