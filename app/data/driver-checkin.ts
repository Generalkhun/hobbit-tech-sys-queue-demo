import type { ContactPhonesValidation } from "../types/driver-portal.ts";

export const checkinRadiusKm = 10;

const phonePattern = /^[0-9+()\-\s]{9,15}$/;
const geolocationPermissionDenied = 1;
const geolocationPositionUnavailable = 2;

export function distanceInKm(
  latitude: number,
  longitude: number,
  targetLatitude: number,
  targetLongitude: number,
): number {
  const radians = (degrees: number): number => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(targetLatitude - latitude);
  const longitudeDelta = radians(targetLongitude - longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(targetLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function isValidPhone(phone: string): boolean {
  return phonePattern.test(phone.trim());
}

export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function getDistanceError(distanceKm: number): string {
  return `ตำแหน่งปัจจุบันอยู่ห่างโรงงาน ${distanceKm.toFixed(1)} กม. ต้องอยู่ในรัศมี ${checkinRadiusKm} กม. จึงจะเช็คอินได้`;
}

export function getGeolocationErrorMessage(code: number): string {
  if (code === geolocationPermissionDenied) {
    return "กรุณาอนุญาตให้เข้าถึงตำแหน่ง เพื่อเช็คอิน online";
  }
  if (code === geolocationPositionUnavailable) {
    return "ไม่สามารถระบุตำแหน่งปัจจุบันได้ กรุณาลองอีกครั้ง";
  }
  return "ใช้เวลาระบุตำแหน่งนานเกินไป กรุณาลองอีกครั้ง";
}

export function validateContactPhones(drafts: string[]): ContactPhonesValidation {
  const phones = drafts.map((phone) => phone.trim()).filter(Boolean);
  if (phones.length === 0) {
    return { phones, error: "กรุณาระบุเบอร์ติดต่ออย่างน้อย 1 เบอร์" };
  }
  if (phones.length > 3) {
    return { phones, error: "ระบุเบอร์ติดต่อได้สูงสุด 3 เบอร์" };
  }
  if (phones.some((phone) => !phonePattern.test(phone))) {
    return { phones, error: "กรุณาตรวจสอบรูปแบบเบอร์โทรศัพท์" };
  }
  return { phones, error: "" };
}

export function replacePrimaryPhone(phones: string[], phone: string): string[] {
  return phones.length === 0 ? [phone] : [phone, ...phones.slice(1)];
}
