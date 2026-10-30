import type { VehicleRecord } from "@/app/types/registry";

const base = {
  shopName: "",
  plateKind: "head",
  photos: {},
  registrationDocument: undefined,
} as const;

/** id ของรถ = ทะเบียน + รหัสจังหวัด (เช่น 70-4380-14 = ทะเบียน 70-4380 จังหวัดพระนครศรีอยุธยา รหัส 14) */
export const mockVehicles: VehicleRecord[] = [
  { ...base, id: "70-4380-14", ownerType: "contractor", carrier: "ขนส่งอยุธยา", vehicleType: "รถบรรทุก 10 ล้อ", plate: "70-4380", province: "พระนครศรีอยุธยา", chassisNumber: "MP65FDOO4NT000149", photos: { front: "https://picsum.photos/seed/truck-704380/480/320" }, status: "active" },
  { ...base, id: "71-2398-13", ownerType: "contractor", carrier: "เอสพี ทรานสปอร์ต", vehicleType: "รถพ่วง 18 ล้อ", plate: "71-2398", province: "ปทุมธานี", chassisNumber: "MP65FDOO4NT000220", photos: { front: "https://picsum.photos/seed/truck-712398/480/320" }, status: "active" },
  { ...base, id: "82-1046-14", ownerType: "contractor", carrier: "ขนส่งอยุธยา", vehicleType: "รถบรรทุก 10 ล้อ", plate: "82-1046", province: "พระนครศรีอยุธยา", chassisNumber: "MP65FDOO4NT000331", photos: { front: "https://picsum.photos/seed/truck-821046/480/320" }, status: "active" },
  { ...base, id: "71-8854-13", ownerType: "contractor", carrier: "เอสพี ทรานสปอร์ต", vehicleType: "รถบรรทุก 6 ล้อ", plate: "71-8854", province: "ปทุมธานี", chassisNumber: "MP65FDOO4NT000442", photos: { front: "https://picsum.photos/seed/truck-718854/480/320" }, status: "pending" },
  { ...base, id: "SYS-006-13", ownerType: "shop", shopName: "ร้านเจริญทรัพย์", carrier: "SYS Fleet", vehicleType: "รถบรรทุก 10 ล้อ", plate: "SYS-006", province: "ปทุมธานี", chassisNumber: "MP65FDOO4NT000553", photos: { front: "https://picsum.photos/seed/truck-sys006/480/320" }, status: "active" },
  { ...base, id: "88-1200-00", ownerType: "contractor", carrier: "", vehicleType: "", plate: "88-1200", province: "", chassisNumber: "", status: "draft", draftStep: 0 },
];
