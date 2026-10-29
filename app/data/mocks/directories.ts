import type { DirectoryPageKey, DirectoryRecord } from "@/app/types/directory";

export const directoryRecords: Record<DirectoryPageKey, DirectoryRecord[]> = {
  "provinces": [
    { id: "10", name: "กรุงเทพมหานคร", detail: "ภาคกลาง · 12 ร้านค้า", status: "active" },
    { id: "13", name: "ปทุมธานี", detail: "ภาคกลาง · 18 ร้านค้า", status: "active" },
    { id: "14", name: "พระนครศรีอยุธยา", detail: "ภาคกลาง · 24 ร้านค้า", status: "active" },
    { id: "19", name: "สระบุรี", detail: "ภาคกลาง · 9 ร้านค้า", status: "active" },
  ],
  "vehicle-types": [
    { id: "VT-01", name: "รถบรรทุก 6 ล้อ", detail: "10–15 ตัน", status: "active" },
    { id: "VT-02", name: "รถบรรทุก 10 ล้อ", detail: "15–25 ตัน", status: "active" },
    { id: "VT-03", name: "รถพ่วง 18 ล้อ", detail: "25–35 ตัน", status: "active" },
  ],
};
