import type { HistoryRow } from "@/app/types/seller";
import type {
  DriverRecord,
  RegistryStatus,
  RegistryStatusAction,
  RegistryStatusRecord,
  VehicleRecord,
} from "@/app/types/registry";
import type { NoteWithAttachments } from "@/app/types/common";

export const driverWizardSteps = 4;
export const vehicleWizardSteps = 4;

export const registryStatusLabels: Record<RegistryStatus, string> = {
  draft: "สร้างไม่เสร็จ",
  pending: "รออนุมัติ",
  active: "ใช้งาน",
  suspended: "ระงับ",
};

export const employmentLabels = {
  employee: "พนักงานของร้านค้า",
  contractor: "พนักงานขับรถรับจ้าง",
} as const;

export const vehicleOwnerLabels = {
  shop: "รถของร้านค้า",
  contractor: "รถรับจ้าง",
} as const;

export const plateKindLabels = { head: "ทะเบียนหัว", tail: "ทะเบียนหาง" } as const;

export const vehiclePhotoSides = [
  { key: "front", label: "ด้านหน้า" },
  { key: "back", label: "ด้านหลัง" },
  { key: "right", label: "ด้านขวา" },
  { key: "left", label: "ด้านซ้าย" },
] as const;

export function isDriverApproved(driver: Pick<DriverRecord, "status">) {
  return driver.status === "active";
}

export function maskNationalId(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 13) return value || "ไม่มีข้อมูล";
  return `${digits[0]}-XXXX-XXXXX-XX-${digits[12]}`;
}

export function buildDriverName(
  driver: Pick<DriverRecord, "prefix" | "firstName" | "lastName">,
) {
  return [driver.prefix, driver.firstName, driver.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function nextRegistryId(prefix: string, ids: string[]) {
  const max = ids.reduce((highest, id) => {
    const value = Number(id.slice(prefix.length + 1));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function createEmptyDriver(id: string): DriverRecord {
  return {
    id,
    name: "",
    prefix: "",
    firstName: "",
    lastName: "",
    employmentType: "contractor",
    shopName: "",
    carrier: "",
    plate: "",
    phone: "",
    email: "",
    nationalId: "",
    licenseNumber: "",
    status: "draft",
    draftStep: 0,
  };
}

export function createEmptyVehicle(id: string): VehicleRecord {
  return {
    id,
    ownerType: "contractor",
    shopName: "",
    carrier: "",
    plateKind: "head",
    vehicleType: "",
    plate: "",
    province: "",
    chassisNumber: "",
    photos: {},
    status: "draft",
    draftStep: 0,
  };
}

const filled = (value: string) => value.trim().length > 0;
const isThaiNationalId = (value: string) => /^\d{13}$/.test(value.replace(/\D/g, ""));

/** รายการข้อมูลที่ยังขาดในแต่ละขั้นของ wizard พนักงานขับรถยนต์ */
export function getDriverStepIssues(driver: DriverRecord, step: number): string[] {
  const issues: string[] = [];
  if (step === 0) {
    if (driver.employmentType === "employee" && !filled(driver.shopName)) issues.push("เลือกร้านค้า");
    if (!filled(driver.firstName)) issues.push("ชื่อ");
    if (!filled(driver.lastName)) issues.push("นามสกุล");
    if (!isThaiNationalId(driver.nationalId)) issues.push("เลขบัตรประชาชน 13 หลัก");
    if (!filled(driver.licenseNumber)) issues.push("เลขใบอนุญาตขับขี่");
    if (!filled(driver.phone)) issues.push("เบอร์โทรศัพท์");
    if (!filled(driver.carrier)) issues.push("บริษัทขนส่ง");
    if (!filled(driver.plate)) issues.push("ทะเบียนรถประจำ");
  }
  if (step === 1 && !driver.photo) issues.push("ภาพถ่ายพนักงาน");
  if (step === 2) {
    if (!driver.idCardImage) issues.push("ภาพบัตรประชาชน");
    if (!driver.licenseImage) issues.push("ภาพใบขับขี่");
  }
  return issues;
}

export function getVehicleStepIssues(vehicle: VehicleRecord, step: number): string[] {
  const issues: string[] = [];
  if (step === 0) {
    if (vehicle.ownerType === "shop" && !filled(vehicle.shopName)) issues.push("เลือกร้านค้า");
    if (!filled(vehicle.carrier)) issues.push("บริษัทขนส่ง");
    if (!filled(vehicle.vehicleType)) issues.push("ประเภทรถยนต์");
    if (!filled(vehicle.plate)) issues.push("ทะเบียนรถยนต์");
    if (!filled(vehicle.province)) issues.push("จังหวัด");
    if (!filled(vehicle.chassisNumber)) issues.push("หมายเลขตัวถัง");
  }
  if (step === 1) {
    (
      [
        ["front", "ด้านหน้า"],
        ["back", "ด้านหลัง"],
        ["right", "ด้านขวา"],
        ["left", "ด้านซ้าย"],
      ] as const
    ).forEach(([key, label]) => {
      if (!vehicle.photos[key]) issues.push(`ภาพรถ${label}`);
    });
  }
  if (step === 2 && !vehicle.registrationDocument) issues.push("เล่มทะเบียนรถ");
  return issues;
}

export function getDriverCompletionIssues(driver: DriverRecord) {
  return [0, 1, 2].flatMap((step) => getDriverStepIssues(driver, step));
}

export function getVehicleCompletionIssues(vehicle: VehicleRecord) {
  return [0, 1, 2].flatMap((step) => getVehicleStepIssues(vehicle, step));
}

/** ผู้ดูแลระบบอนุมัติทันที ผู้ใช้อื่นต้องรออนุมัติ */
export function getCompletionStatus(isAdmin: boolean): RegistryStatus {
  return isAdmin ? "active" : "pending";
}

export function finalizeDriver(driver: DriverRecord, isAdmin: boolean): DriverRecord {
  return {
    ...driver,
    name: buildDriverName(driver),
    status: getCompletionStatus(isAdmin),
    draftStep: undefined,
  };
}

export function saveDriverDraft(driver: DriverRecord, step: number): DriverRecord {
  return { ...driver, name: buildDriverName(driver), status: "draft", draftStep: step };
}

export function finalizeVehicle(vehicle: VehicleRecord, isAdmin: boolean): VehicleRecord {
  return { ...vehicle, status: getCompletionStatus(isAdmin), draftStep: undefined };
}

export function saveVehicleDraft(vehicle: VehicleRecord, step: number): VehicleRecord {
  return { ...vehicle, status: "draft", draftStep: step };
}

export const statusActionTargets: Record<RegistryStatusAction, RegistryStatus> = {
  approve: "active",
  suspend: "suspended",
  release: "active",
};

/** การกระทำที่ทำได้ตามสถานะปัจจุบัน */
export function getAvailableStatusAction(
  status: RegistryStatus,
): RegistryStatusAction | null {
  if (status === "pending") return "approve";
  if (status === "active") return "suspend";
  if (status === "suspended") return "release";
  return null;
}

export function createStatusRecord(
  targetId: string,
  action: RegistryStatusAction,
  value: NoteWithAttachments,
  by: string,
  now: Date = new Date(),
): RegistryStatusRecord {
  return {
    id: `RS-${now.getTime().toString(36)}`,
    targetId,
    action,
    at: now.toISOString(),
    by,
    note: value.note.trim(),
    attachments: value.attachments,
  };
}

const actionLabels: Record<RegistryStatusAction, string> = {
  approve: "อนุมัติ",
  suspend: "ระงับ",
  release: "ปลดการระงับ",
};

export function buildStatusRows(
  records: RegistryStatusRecord[],
  targetId: string,
): HistoryRow[] {
  return records
    .filter((record) => record.targetId === targetId)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((record) => ({
      id: record.id,
      at: record.at,
      action: actionLabels[record.action],
      tone: record.action === "suspend" ? "out" : "in",
      by: record.by,
      note: record.note,
      attachments: record.attachments,
    }));
}

export function matchesSearch(fields: string[], query: string) {
  return fields.join(" ").toLowerCase().includes(query.trim().toLowerCase());
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  return {
    pageCount,
    currentPage,
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}
