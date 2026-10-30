import type { SavedPlanDay } from "@/app/types/plans";

/**
 * วันที่บันทึกแผนรับเหล็กไว้แล้ว (ตัวอย่าง) — ใช้ให้ปฏิทินแสดงสีเขียวจาง
 * วันที่ในอดีต/วันนี้ถือว่า "ล็อก" แล้ว จึงมี savedDays ตามไปด้วย
 */
export const mockSavedPlanDays: Record<string, SavedPlanDay> = {
  "2026-10-20": { locked: true, savedAt: "2026-10-19T16:30:00+07:00" },
  "2026-10-21": { locked: true, savedAt: "2026-10-20T15:10:00+07:00" },
  "2026-10-22": { locked: true, savedAt: "2026-10-21T17:05:00+07:00" },
  "2026-10-23": { locked: true, savedAt: "2026-10-22T16:45:00+07:00" },
  "2026-10-26": { locked: true, savedAt: "2026-10-25T14:20:00+07:00" },
  "2026-10-27": { locked: true, savedAt: "2026-10-26T18:00:00+07:00" },
  "2026-10-28": { locked: false, savedAt: "2026-10-27T09:15:00+07:00" },
  "2026-10-29": { locked: false, savedAt: "2026-10-27T10:40:00+07:00" },
  "2026-10-30": { locked: false, savedAt: "2026-10-27T11:25:00+07:00" },
};
