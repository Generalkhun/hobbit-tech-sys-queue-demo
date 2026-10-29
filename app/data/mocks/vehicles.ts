import type { VehicleRecord } from "@/app/types/registry";

const base = {
  shopName: "",
  plateKind: "head",
  photos: {},
  registrationDocument: undefined,
} as const;

export const mockVehicles: VehicleRecord[] = [
  { ...base, id: "V-001", ownerType: "contractor", carrier: "ขนส่งอยุธยา", vehicleType: "รถบรรทุก 10 ล้อ", plate: "70-4380", province: "พระนครศรีอยุธยา", chassisNumber: "MP65FDOO4NT000149", status: "active" },
  { ...base, id: "V-002", ownerType: "contractor", carrier: "เอสพี ทรานสปอร์ต", vehicleType: "รถพ่วง 18 ล้อ", plate: "71-2398", province: "ปทุมธานี", chassisNumber: "MP65FDOO4NT000220", status: "active" },
  { ...base, id: "V-003", ownerType: "contractor", carrier: "ขนส่งอยุธยา", vehicleType: "รถบรรทุก 10 ล้อ", plate: "82-1046", province: "พระนครศรีอยุธยา", chassisNumber: "MP65FDOO4NT000331", status: "active" },
  { ...base, id: "V-004", ownerType: "contractor", carrier: "เอสพี ทรานสปอร์ต", vehicleType: "รถบรรทุก 6 ล้อ", plate: "71-8854", province: "ปทุมธานี", chassisNumber: "MP65FDOO4NT000442", status: "pending" },
  { ...base, id: "V-005", ownerType: "shop", shopName: "ร้านเจริญทรัพย์", carrier: "SYS Fleet", vehicleType: "รถบรรทุก 10 ล้อ", plate: "SYS-006", province: "ปทุมธานี", chassisNumber: "MP65FDOO4NT000553", status: "active" },
  { ...base, id: "V-006", ownerType: "contractor", carrier: "", vehicleType: "", plate: "88-1200", province: "", chassisNumber: "", status: "draft", draftStep: 0 },
];
