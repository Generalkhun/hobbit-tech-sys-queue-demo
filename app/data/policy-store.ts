import { mockPolicyAcknowledgements, policyVersion } from "@/app/data/mock-data";
import type { PolicyAcknowledgement } from "@/app/types/queue";

const storageKey = "sys-queue-policy-acknowledgements";
const listeners = new Set<() => void>();
let acknowledgements = mockPolicyAcknowledgements;
let storageError = "";
let hasLoaded = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function loadStoredAcknowledgements() {
  if (hasLoaded || typeof window === "undefined") return;
  hasLoaded = true;
  let stored: string | null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch (error) {
    if (error instanceof DOMException) {
      storageError = "ไม่สามารถอ่านบันทึกการยอมรับ PDPA จากเบราว์เซอร์ได้";
      return;
    }
    throw error;
  }
  if (!stored) return;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      storageError = "รูปแบบบันทึกการยอมรับ PDPA ไม่ถูกต้อง";
      return;
    }
    const validAcknowledgements = parsed.filter(isPolicyAcknowledgement);
    if (validAcknowledgements.length !== parsed.length) {
      storageError = "พบรายการบันทึกการยอมรับ PDPA ที่ข้อมูลไม่ครบถ้วน";
      return;
    }
    acknowledgements = validAcknowledgements;
  } catch (error) {
    if (error instanceof SyntaxError) {
      storageError = "ไม่สามารถอ่านบันทึกการยอมรับ PDPA ที่จัดเก็บไว้ได้";
      return;
    }
    throw error;
  }
}

function isPolicyAcknowledgement(
  value: unknown,
): value is PolicyAcknowledgement {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.shopName === "string" &&
    (record.documentType === "privacy-notice" ||
      record.documentType === "personal-data-use") &&
    typeof record.policyVersion === "string" &&
    typeof record.acknowledgedAt === "string" &&
    typeof record.acknowledgedBy === "string"
  );
}

export function subscribeToPolicyAcknowledgements(listener: () => void) {
  listeners.add(listener);
  const previous = acknowledgements;
  loadStoredAcknowledgements();
  if (previous !== acknowledgements || storageError) listener();
  return () => listeners.delete(listener);
}

export function getPolicyAcknowledgements() {
  return acknowledgements;
}

export function getServerPolicyAcknowledgements() {
  return mockPolicyAcknowledgements;
}

export function getPolicyStorageError() {
  return storageError;
}

export function acknowledgeShopPolicies(shopName: string, userId: string) {
  const acknowledgedAt = new Date().toISOString();
  const newAcknowledgements: PolicyAcknowledgement[] = (
    ["privacy-notice", "personal-data-use"] as const
  ).map((documentType) => ({
    shopName,
    documentType,
    policyVersion,
    acknowledgedAt,
    acknowledgedBy: userId,
  }));
  const updatedAcknowledgements = [
    ...acknowledgements,
    ...newAcknowledgements,
  ];

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(updatedAcknowledgements),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      storageError = "บันทึกการยอมรับ PDPA ไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์";
      notify();
      return false;
    }
    throw error;
  }

  acknowledgements = updatedAcknowledgements;
  storageError = "";
  notify();
  return true;
}
