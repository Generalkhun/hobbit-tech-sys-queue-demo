import type { IsoDateTime, NoteAttachment } from "@/app/types/common";

/** draft = สร้างไม่เสร็จ, pending = รออนุมัติ, active = ใช้งาน, suspended = ระงับ */
export type RegistryStatus = "draft" | "pending" | "active" | "suspended";

/** employee = พนักงานของร้านค้า, contractor = พนักงานขับรถรับจ้าง */
export type EmploymentType = "employee" | "contractor";

export interface DriverRecord {
  id: string;
  name: string;
  prefix: string;
  firstName: string;
  lastName: string;
  employmentType: EmploymentType;
  /** ร้านค้าที่สังกัด เมื่อเป็นพนักงานของร้านค้า */
  shopName: string;
  carrier: string;
  /** ทะเบียนรถประจำที่ผูกกับผู้ขับ */
  plate: string;
  phone: string;
  email: string;
  nationalId: string;
  licenseNumber: string;
  drivingHistory?: string;
  photo?: string;
  idCardImage?: string;
  licenseImage?: string;
  status: RegistryStatus;
  /** ขั้นที่ค้างไว้ของ wizard เมื่อสถานะเป็น draft */
  draftStep?: number;
}

export type VehicleOwnerType = "shop" | "contractor";
export type PlateKind = "head" | "tail";

export interface VehiclePhotos {
  front?: string;
  back?: string;
  right?: string;
  left?: string;
}

export interface VehicleRecord {
  id: string;
  ownerType: VehicleOwnerType;
  shopName: string;
  carrier: string;
  plateKind: PlateKind;
  vehicleType: string;
  plate: string;
  province: string;
  chassisNumber: string;
  photos: VehiclePhotos;
  /** เล่มทะเบียนรถ */
  registrationDocument?: string;
  status: RegistryStatus;
  draftStep?: number;
}

export type RegistryStatusAction = "approve" | "suspend" | "release";

/** ประวัติการเปลี่ยนสถานะของผู้ขับหรือรถ */
export interface RegistryStatusRecord {
  id: string;
  targetId: string;
  action: RegistryStatusAction;
  at: IsoDateTime;
  by: string;
  note: string;
  attachments: NoteAttachment[];
}
