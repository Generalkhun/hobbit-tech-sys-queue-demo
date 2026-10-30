"use client";

import { useState } from "react";
import { mockDailyDemand } from "@/app/data/mocks/daily-demand";
import { setDayDemand } from "@/app/data/plan-calendar";
import type { DailyDemand, DemandKgByGrade } from "@/app/types/plans";

export function useDailyDemand() {
  const [demand, setDemand] = useState<DailyDemand>(mockDailyDemand);

  function saveDemand(date: string, byGrade: DemandKgByGrade) {
    setDemand((current) => setDayDemand(current, date, byGrade));
  }

  return { demand, saveDemand };
}
