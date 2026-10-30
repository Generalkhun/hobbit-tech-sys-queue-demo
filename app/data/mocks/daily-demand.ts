import type { DailyDemand } from "@/app/types/plans";

export const mockDailyDemand: DailyDemand = {
  // ตุลาคม 2569 (เดือนปัจจุบันของ demo)
  "2026-10-20": { "Bundle SY": 40000, "Local O": 20000 },
  "2026-10-21": { "Scrap (D)": 24000 },
  "2026-10-22": { "Bundle SY": 36000, "PM Scrap L1": 18000 },
  "2026-10-23": { "Local O": 28000 },
  "2026-10-26": { "Bundle SY": 44000, "Scrap Return SP": 16000 },
  "2026-10-27": { "Bundle SY": 52000, "Local O": 24000, "Scrap (D)": 20000 },
  "2026-10-28": { "PM Scrap L1": 32000 },
  "2026-10-29": { "Local O": 26000, "Scrap Return SP": 14000 },
  "2026-10-30": { "Bundle SY": 38000 },
  // พฤศจิกายน 2569
  "2026-11-10": { "Bundle SY": 30000, "Local O": 15000 },
  "2026-11-12": { "Local O": 12000 },
};
