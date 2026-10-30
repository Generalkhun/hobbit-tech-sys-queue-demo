import type { CheckinLog } from "@/app/types/queue";

const storage: CheckinLog[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeToCheckinLogs(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCheckinLogs(): CheckinLog[] {
  return [...storage];
}

export function getCheckinLogsByShop(shopName: string): CheckinLog[] {
  return storage.filter((log) => log.shopName === shopName);
}

export function getCheckinLogsBySeller(sellerName: string): CheckinLog[] {
  return storage.filter((log) => log.sellerName === sellerName);
}

export function getCheckinLogsByDriver(driverName: string): CheckinLog[] {
  return storage.filter((log) => log.driverName === driverName);
}

export function addCheckinLog(log: CheckinLog) {
  storage.push(log);
  notify();
}

/**
 * บันทึกการเช็คอิน พร้อมตรวจสอบความสาย
 * ถ้าเช็คอินช้ากว่าเวลาจอง 10 นาที ถือว่าสาย
 */
export function recordCheckin(
  bookingId: string,
  shopName: string,
  sellerName: string,
  driverName: string,
  plate: string,
  scheduledDate: string,
  scheduledTimeSlot: string,
  checkinTime: string,
  recordedBy: string,
): CheckinLog {
  const scheduledHour = parseInt(scheduledTimeSlot.split(":")[0], 10);
  const checkinHour = parseInt(checkinTime.split(":")[0], 10);
  const checkinMinute = parseInt(checkinTime.split(":")[1], 10);
  const scheduledMinutes = scheduledHour * 60;
  const checkinMinutes = checkinHour * 60 + checkinMinute;
  const lateMinutes = Math.max(0, checkinMinutes - scheduledMinutes);
  const status = lateMinutes >= 10 ? "late" : "on-time";

  const log: CheckinLog = {
    id: `CL-${Date.now().toString(36)}-${storage.length + 1}`,
    bookingId,
    shopName,
    sellerName,
    driverName,
    plate,
    scheduledDate,
    scheduledTimeSlot,
    checkinTime,
    status,
    lateMinutes,
    recordedBy,
    recordedAt: new Date().toISOString(),
  };
  addCheckinLog(log);
  return log;
}

export function recordNoShow(
  bookingId: string,
  shopName: string,
  sellerName: string,
  driverName: string,
  plate: string,
  scheduledDate: string,
  scheduledTimeSlot: string,
  recordedBy: string,
): CheckinLog {
  const log: CheckinLog = {
    id: `CL-${Date.now().toString(36)}-${storage.length + 1}`,
    bookingId,
    shopName,
    sellerName,
    driverName,
    plate,
    scheduledDate,
    scheduledTimeSlot,
    checkinTime: "",
    status: "no-show",
    lateMinutes: 0,
    recordedBy,
    recordedAt: new Date().toISOString(),
  };
  addCheckinLog(log);
  return log;
}