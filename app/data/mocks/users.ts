import type { DemoUser } from "@/app/types/queue";

export const demoUsers: DemoUser[] = [
  {
    id: "admin",
    name: "ธนนันท์ รัตนกุลชัยวัฒน์",
    organization: "SYS · เจ้าหน้าที่จัดหาเศษเหล็ก (จศ.)",
    role: "admin",
    initials: "ธน",
  },
  {
    id: "broker",
    name: "คุณพิมพ์ชนก",
    organization: "บริษัท เอส.เอส. เมทัล · นายหน้า",
    role: "broker",
    initials: "พช",
  },
  {
    id: "operations",
    name: "คุณปฏิบัติการ SYS",
    organization: "SYS · ทีมปฏิบัติการเศษเหล็ก (ปศ.)",
    role: "operations",
    initials: "ปศ",
  },
  {
    id: "retailer",
    name: "คุณสมชาย ใจดี",
    organization: "ร้านสมชายค้าเหล็ก · ร้านค้าของเก่า",
    role: "retailer",
    initials: "สช",
  },
  {
    id: "security",
    name: "คุณสมพงษ์ รักษาการ",
    organization: "รปภ. ประจำโรงงาน SYS 1",
    role: "security",
    initials: "สพ",
  },
  {
    id: "driver",
    name: "สมชาย ใจดี",
    organization: "ขนส่งอยุธยา · พนักงานขับรถ",
    role: "driver",
    initials: "สช",
    driverId: "D-001",
  },
];
