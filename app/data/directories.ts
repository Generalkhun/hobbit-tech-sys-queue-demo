import { provinceRecords, vehicleTypeRecords } from "@/app/data/mocks/directories";
import type { ProvinceRecord, VehicleTypeRecord } from "@/app/types/directory";
import type { PageKey } from "@/app/types/queue";

export type {
  DirectoryPageKey,
  ProvinceRecord,
  VehicleTypeRecord,
  VehicleTypeSpec,
} from "@/app/types/directory";

export const provinces = provinceRecords;
export const vehicleTypes = vehicleTypeRecords;

export function isDirectoryPage(page: PageKey): page is "provinces" | "vehicle-types" {
  return page === "provinces" || page === "vehicle-types";
}

/** ค้นหาจังหวัดจากชื่อ — ใช้สำหรับสร้าง id รถ (ทะเบียน-รหัสจังหวัด) */
export function findProvinceCode(name: string): string | null {
  const province = provinceRecords.find((item) => item.name === name.trim());
  return province ? province.code : null;
}
