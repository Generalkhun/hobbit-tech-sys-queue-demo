import type { PageKey } from "@/app/types/queue";

export type DirectoryPageKey =
  | "brokers"
  | "sellers"
  | "shops"
  | "vehicles"
  | "provinces"
  | "vehicle-types";

export interface DirectoryRecord {
  id: string;
  name: string;
  detail: string;
  status: "active" | "pending";
}

export interface DirectoryDefinition {
  page: DirectoryPageKey;
  title: string;
  description: string;
  noun: string;
  icon: "users" | "warehouse" | "truck" | "map" | "weight";
  columns: [string, string];
  records: DirectoryRecord[];
}

export const directoryDefinitions: Record<
  DirectoryPageKey,
  DirectoryDefinition
> = {
  brokers: {
    page: "brokers",
    title: "นายหน้าเศษเหล็ก",
    description: "ข้อมูลผู้ขายและนายหน้าที่ประสานงานกับ SYS",
    noun: "นายหน้า",
    icon: "users",
    columns: ["ผู้ติดต่อ", "ร้านค้าในเครือ"],
    records: [
      { id: "BR-001", name: "บริษัท เอส.เอส. เมทัล", detail: "6 ร้านค้า", status: "active" },
      { id: "BR-002", name: "หจก. รุ่งกิจรีไซเคิล", detail: "3 ร้านค้า", status: "active" },
      { id: "BR-003", name: "บริษัท เมืองทองรีไซเคิล", detail: "รอตรวจสอบ", status: "pending" },
    ],
  },
  sellers: {
    page: "sellers",
    title: "ผู้ขายเศษเหล็ก",
    description: "จัดการข้อมูลผู้ขายและนายหน้าที่มีสิทธิ์ทำรายการ",
    noun: "ผู้ขาย",
    icon: "users",
    columns: ["ผู้ประสานงาน", "เบอร์ติดต่อ"],
    records: [
      { id: "SL-001", name: "บริษัท เอส.เอส. เมทัล", detail: "02-555-0188", status: "active" },
      { id: "SL-002", name: "หจก. รุ่งกิจรีไซเคิล", detail: "081-555-1042", status: "active" },
      { id: "SL-003", name: "บริษัท เมืองทองรีไซเคิล", detail: "02-788-3400", status: "pending" },
    ],
  },
  shops: {
    page: "shops",
    title: "ร้านค้าย่อย",
    description: "ร้านค้าของเก่าที่มีเศษเหล็กและเป็นผู้จองรถเข้ารับ",
    noun: "ร้านค้า",
    icon: "warehouse",
    columns: ["ผู้ขาย / นายหน้า", "พื้นที่"],
    records: [
      { id: "SH-001", name: "ร้านสมชายค้าเหล็ก", detail: "เอส.เอส. เมทัล · อยุธยา", status: "active" },
      { id: "SH-002", name: "ร้านเจริญทรัพย์", detail: "เอส.เอส. เมทัล · ปทุมธานี", status: "active" },
      { id: "SH-003", name: "ร้านทองดี รีไซเคิล", detail: "อิสระ · สระบุรี", status: "active" },
    ],
  },
  vehicles: {
    page: "vehicles",
    title: "รถยนต์",
    description: "รถขนส่งที่ลงทะเบียนภายใต้บริษัทและสถานะอนุมัติ",
    noun: "รถยนต์",
    icon: "truck",
    columns: ["บริษัทขนส่ง", "ผู้ขับที่ลงทะเบียน"],
    records: [
      { id: "70-4380", name: "รถบรรทุก 10 ล้อ", detail: "ขนส่งอยุธยา · สมชาย ใจดี", status: "active" },
      { id: "71-2398", name: "รถพ่วง 18 ล้อ", detail: "เอสพี ทรานสปอร์ต · วิชัย พูนผล", status: "active" },
      { id: "SYS-006", name: "รถบรรทุก 10 ล้อ", detail: "SYS Fleet · กิตติพงษ์ สายใจ", status: "active" },
    ],
  },
  provinces: {
    page: "provinces",
    title: "จังหวัด",
    description: "ข้อมูลพื้นที่สำหรับร้านค้าและบริษัทขนส่ง",
    noun: "จังหวัด",
    icon: "map",
    columns: ["ภูมิภาค", "จำนวนร้านค้า"],
    records: [
      { id: "10", name: "กรุงเทพมหานคร", detail: "ภาคกลาง · 12 ร้านค้า", status: "active" },
      { id: "13", name: "ปทุมธานี", detail: "ภาคกลาง · 18 ร้านค้า", status: "active" },
      { id: "14", name: "พระนครศรีอยุธยา", detail: "ภาคกลาง · 24 ร้านค้า", status: "active" },
      { id: "19", name: "สระบุรี", detail: "ภาคกลาง · 9 ร้านค้า", status: "active" },
    ],
  },
  "vehicle-types": {
    page: "vehicle-types",
    title: "ประเภทรถ",
    description: "กำหนดประเภทและรายละเอียดรถที่ใช้ลงทะเบียน",
    noun: "ประเภทรถ",
    icon: "truck",
    columns: ["ความจุโดยประมาณ", "สถานะการใช้งาน"],
    records: [
      { id: "VT-01", name: "รถบรรทุก 6 ล้อ", detail: "10–15 ตัน", status: "active" },
      { id: "VT-02", name: "รถบรรทุก 10 ล้อ", detail: "15–25 ตัน", status: "active" },
      { id: "VT-03", name: "รถพ่วง 18 ล้อ", detail: "25–35 ตัน", status: "active" },
    ],
  },
};

export function isDirectoryPage(page: PageKey): page is DirectoryPageKey {
  return page in directoryDefinitions;
}
