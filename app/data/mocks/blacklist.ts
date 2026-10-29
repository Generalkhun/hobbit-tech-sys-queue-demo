import type { BlacklistRecord } from "@/app/types/queue";

export const mockBlacklist: BlacklistRecord[] = [
  {
    id: "BL-001",
    targetType: "vehicle",
    targetId: "71-2398",
    displayName: "รถทะเบียน 71-2398",
    reason: "เอกสารรถอยู่ระหว่างตรวจสอบ",
  },
  {
    id: "BL-002",
    targetType: "driver",
    targetId: "D-003",
    displayName: "ประทีป คงดี",
    reason: "ระงับการใช้บัญชีชั่วคราว",
  },
];
