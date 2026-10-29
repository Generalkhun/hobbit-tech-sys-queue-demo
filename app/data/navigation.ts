import type { IconName } from "@/app/components/icons";
import type { PageKey } from "@/app/types/queue";

export interface NavigationItem {
  id: PageKey;
  label: string;
  icon: IconName;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "เมนูหลัก",
    items: [
      { id: "overview", label: "แดชบอร์ด", icon: "dashboard" },
      { id: "plans", label: "แผนรับเหล็ก", icon: "calendar" },
      { id: "booking", label: "ใบนำส่งเศษเหล็ก", icon: "document" },
      { id: "operations", label: "จัดการการจัดส่ง (ปศ.)", icon: "truck" },
      { id: "security", label: "เรียกรถ (รปภ.)", icon: "shield" },
      { id: "driver-pass", label: "ใบนำส่งสำหรับงานนี้", icon: "document" },
      { id: "driver-checkin", label: "เช็คอิน online", icon: "map" },
      { id: "driver-queue", label: "แถบรอคิว", icon: "clock" },
      {
        id: "operation-notes",
        label: "จัดการใบนำส่งเศษเหล็ก (ปศ.)",
        icon: "clipboard",
      },
      { id: "queue-check", label: "ตรวจคิว", icon: "search" },
    ],
  },
  {
    label: "จัดการข้อมูล",
    items: [
      { id: "sellers", label: "ผู้ขายเศษเหล็ก", icon: "user" },
      { id: "shops", label: "ร้านค้าย่อย", icon: "warehouse" },
      { id: "drivers", label: "พนักงานขับรถยนต์", icon: "users" },
      { id: "vehicles", label: "รถยนต์", icon: "truck" },
      { id: "provinces", label: "จังหวัด", icon: "map" },
      { id: "vehicle-types", label: "ประเภทรถ", icon: "weight" },
    ],
  },
];

export const pageDetails: Record<PageKey, { title: string; subtitle: string }> = {
  overview: {
    title: "แดชบอร์ด",
    subtitle: "ภาพรวมคิว ปริมาณจอง และสถานะรถของโรงงาน SYS",
  },
  plans: {
    title: "แผนรับเหล็ก",
    subtitle: "กำหนดปริมาณรับแยกตามโรงงาน เกรด และช่วงเวลา",
  },
  booking: {
    title: "ใบนำส่งเศษเหล็ก",
    subtitle: "จองคิวส่งเศษเหล็ก พร้อมแนบใบชั่งต้นทาง",
  },
  operations: {
    title: "จัดการการจัดส่ง (ปศ.)",
    subtitle: "กำหนดความจุต่อ slot และโยกรถสลับโรงงานหลัง รปภ. จัดคิว",
  },
  security: {
    title: "เรียกรถ (รปภ.)",
    subtitle: "สถานีแรก · ตรวจใบนำส่งและบันทึกรถผ่านป้อม",
  },
  "delivery-notes": {
    title: "ใบนำส่งเศษเหล็ก",
    subtitle: "รายการจองและสถานะใบนำส่งของคุณ",
  },
  "operation-notes": {
    title: "จัดการใบนำส่งเศษเหล็ก (ปศ.)",
    subtitle: "ตรวจรายการใบนำส่งและสถานะรถในความรับผิดชอบ",
  },
  "queue-check": {
    title: "ตรวจคิว",
    subtitle: "ค้นหาใบนำส่ง ทะเบียนรถ และสถานะคิว",
  },
  sellers: {
    title: "ผู้ขายเศษเหล็ก",
    subtitle: "ข้อมูลผู้ขายที่ได้รับอนุญาตให้ทำรายการ",
  },
  shops: {
    title: "ร้านค้าย่อย",
    subtitle: "ร้านค้าของเก่าที่มีเศษเหล็กและเป็นผู้จองรถ",
  },
  drivers: {
    title: "พนักงานขับรถยนต์",
    subtitle: "ทะเบียนผู้ขับภายใต้บริษัทขนส่งและสถานะอนุมัติ",
  },
  vehicles: {
    title: "รถยนต์",
    subtitle: "ข้อมูลรถขนส่งที่ลงทะเบียนในระบบ",
  },
  provinces: {
    title: "จังหวัด",
    subtitle: "ข้อมูลพื้นที่ของร้านค้าและบริษัทขนส่ง",
  },
  "vehicle-types": {
    title: "ประเภทรถ",
    subtitle: "จัดการประเภทและรายละเอียดรถที่ใช้ลงทะเบียน",
  },
  settings: {
    title: "ตั้งค่า",
    subtitle: "การตั้งค่าระบบจัดการคิว SYS",
  },
  "driver-pass": {
    title: "ใบนำส่งสำหรับงานนี้",
    subtitle: "รายละเอียดงานที่รถของคุณจะใช้รับเศษเหล็ก",
  },
  "driver-checkin": {
    title: "เช็คอิน online",
    subtitle: "เริ่มเช็คอินเมื่ออยู่ในรัศมี 10 กิโลเมตรจากโรงงาน",
  },
  "driver-queue": {
    title: "แถบรอคิว",
    subtitle: "ติดตามสถานะการติดต่อกลับจาก SYS",
  },
};
