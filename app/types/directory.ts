export type DirectoryPageKey = "provinces" | "vehicle-types";

/** จังหวัดในระบบ — code คือรหัสมาตรฐานกรมการขนส่งทางบก */
export interface ProvinceRecord {
  code: string;
  name: string;
  region: string;
}

/** Spec ของประเภทรถยนต์ */
export interface VehicleTypeSpec {
  /** ความเหมาะสมในการบรรทุกเหล็ก */
  suitableFor: string;
  /** น้ำหนักสูงสุดที่เหมาะสม (ตัน) */
  maxTons: number;
  note?: string;
}

/** ประเภทรถยนต์ */
export interface VehicleTypeRecord {
  id: string;
  name: string;
  description: string;
  /** รูปภาพประเภทรถ — ใส่ได้หลายรูป */
  images: string[];
  spec: VehicleTypeSpec;
}
