import type { DailyDemand } from "@/app/types/plans";

export const mockDailyDemand: DailyDemand = {
  "2026-11-10": {
    SYS1: { "Bundle SY": 20000, "Local O": 15000 },
    SYS2: { "Bundle SY": 10000 },
  },
  "2026-11-12": {
    SYS1: { "Local O": 12000 },
  },
};
