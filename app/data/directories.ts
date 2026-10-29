import { directoryRecords } from "@/app/data/mocks/directories";
import type { DirectoryDefinition, DirectoryPageKey } from "@/app/types/directory";
import type { PageKey } from "@/app/types/queue";

export type { DirectoryDefinition, DirectoryPageKey, DirectoryRecord } from "@/app/types/directory";

export const directoryDefinitions: Record<
  DirectoryPageKey,
  DirectoryDefinition
> = {
  vehicles: {
    page: "vehicles",
    title: "รถยนต์",
    description: "รถขนส่งที่ลงทะเบียนภายใต้บริษัทและสถานะอนุมัติ",
    noun: "รถยนต์",
    icon: "truck",
    columns: ["บริษัทขนส่ง", "ผู้ขับที่ลงทะเบียน"],
    records: directoryRecords["vehicles"],
  },
  provinces: {
    page: "provinces",
    title: "จังหวัด",
    description: "ข้อมูลพื้นที่สำหรับร้านค้าและบริษัทขนส่ง",
    noun: "จังหวัด",
    icon: "map",
    columns: ["ภูมิภาค", "จำนวนร้านค้า"],
    records: directoryRecords["provinces"],
  },
  "vehicle-types": {
    page: "vehicle-types",
    title: "ประเภทรถ",
    description: "กำหนดประเภทและรายละเอียดรถที่ใช้ลงทะเบียน",
    noun: "ประเภทรถ",
    icon: "truck",
    columns: ["ความจุโดยประมาณ", "สถานะการใช้งาน"],
    records: directoryRecords["vehicle-types"],
  },
};

export function isDirectoryPage(page: PageKey): page is DirectoryPageKey {
  return page in directoryDefinitions;
}
