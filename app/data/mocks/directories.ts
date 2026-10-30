import type {
  DirectoryPageKey,
  ProvinceRecord,
  VehicleTypeRecord,
} from "@/app/types/directory";

export const provinceRecords: ProvinceRecord[] = [
  { code: "10", name: "กรุงเทพมหานคร", region: "ภาคกลาง" },
  { code: "11", name: "สมุทรปราการ", region: "ภาคกลาง" },
  { code: "12", name: "นนทบุรี", region: "ภาคกลาง" },
  { code: "13", name: "ปทุมธานี", region: "ภาคกลาง" },
  { code: "14", name: "พระนครศรีอยุธยา", region: "ภาคกลาง" },
  { code: "15", name: "อ่างทอง", region: "ภาคกลาง" },
  { code: "16", name: "ลพบุรี", region: "ภาคกลาง" },
  { code: "17", name: "สิงห์บุรี", region: "ภาคกลาง" },
  { code: "18", name: "ชัยนาท", region: "ภาคกลาง" },
  { code: "19", name: "สระบุรี", region: "ภาคกลาง" },
  { code: "20", name: "ชลบุรี", region: "ภาคตะวันออก" },
  { code: "21", name: "ระยอง", region: "ภาคตะวันออก" },
  { code: "22", name: "จันทบุรี", region: "ภาคตะวันออก" },
  { code: "23", name: "ตราด", region: "ภาคตะวันออก" },
];

export const vehicleTypeRecords: VehicleTypeRecord[] = [
  {
    id: "VT-01",
    name: "รถบรรทุก 6 ล้อ",
    description:
      "รถบรรทุกขนาดเล็ก เหมาะกับงานขนส่งระยะใกล้ปริมาณไม่มาก คล่องตัวในซอยแคบ",
    images: [
      "https://picsum.photos/seed/steel-truck-6l-a/480/320",
      "https://picsum.photos/seed/steel-truck-6l-b/480/320",
      "https://picsum.photos/seed/steel-truck-6l-c/480/320",
    ],
    spec: {
      suitableFor: "ขนส่งเหล็กเศษปริมาณน้อย-ปานกลาง ภายในจังหวัด/ปริมณฑล",
      maxTons: 15,
      note: "น้ำหนักสุทธิเฉลี่ย 10–15 ตันต่อเที่ยว",
    },
  },
  {
    id: "VT-02",
    name: "รถบรรทุก 10 ล้อ",
    description:
      "รถบรรทุกขนาดกลาง มาตรฐานขนส่งเหล็กเศษทั่วไป รับน้ำหนักได้ดี เหมาะกับงานส่งโรงงานเป็นประจำ",
    images: [
      "https://picsum.photos/seed/steel-truck-10l-a/480/320",
      "https://picsum.photos/seed/steel-truck-10l-b/480/320",
    ],
    spec: {
      suitableFor: "ขนส่งเหล็กเศษปริมาณปานกลาง-มาก ทั้งในและต่างจังหวัด",
      maxTons: 25,
      note: "น้ำหนักสุทธิเฉลี่ย 15–25 ตันต่อเที่ยว",
    },
  },
  {
    id: "VT-03",
    name: "รถพ่วง 18 ล้อ",
    description:
      "รถพ่วงขนาดใหญ่ เหมาะกับงานขนส่งเหล็กปริมาณมากทางไกล ประหยัดต่อเที่ยว",
    images: [
      "https://picsum.photos/seed/steel-trailer-18l-a/480/320",
      "https://picsum.photos/seed/steel-trailer-18l-b/480/320",
      "https://picsum.photos/seed/steel-trailer-18l-c/480/320",
      "https://picsum.photos/seed/steel-trailer-18l-d/480/320",
    ],
    spec: {
      suitableFor: "ขนส่งเหล็กเศษปริมาณมาก ทางไกลระหว่างจังหวัด",
      maxTons: 35,
      note: "น้ำหนักสุทธิเฉลี่ย 25–35 ตันต่อเที่ยว",
    },
  },
];

/** สำหรับความเข้ากันได้กับโค้ดเดิมที่อ่าน directoryRecords */
export const directoryRecords: Record<DirectoryPageKey, unknown[]> = {
  provinces: provinceRecords,
  "vehicle-types": vehicleTypeRecords,
};
