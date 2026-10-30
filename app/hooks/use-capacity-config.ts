"use client";

import { useState } from "react";
import {
  copyDateConfig,
  emptyCapacityConfig,
  resetSlotCapacities,
  setHourlyDefault,
  setReopenOverride,
  setSlotCapacities,
  setSlotClosure,
  type GradeCapacities,
} from "@/app/data/slot-capacity";
import type { SavedPlanDay } from "@/app/types/plans";

export function useCapacityConfig() {
  const [draftConfig, setDraftConfig] = useState(emptyCapacityConfig);
  const [savedConfig, setSavedConfig] = useState(emptyCapacityConfig);
  const [savedDays, setSavedDays] = useState<Record<string, SavedPlanDay>>({});

  function changeHourlyDefault(date: string, plantId: string, value: number) {
    setDraftConfig((current) => setHourlyDefault(current, date, plantId, value));
  }

  function changeSlotCapacities(
    date: string,
    plantId: string,
    slot: string,
    capacities: GradeCapacities,
    closureReason: string | null,
  ) {
    setDraftConfig((current) =>
      setSlotClosure(
        setSlotCapacities(current, date, plantId, slot, capacities),
        date,
        plantId,
        slot,
        closureReason,
      ),
    );
  }

  /** เปิดรับ (หรือปิด) slot ที่เป็น rush hour กลับ */
  function changeReopenOverride(
    date: string,
    plantId: string,
    slot: string,
    reopen: boolean,
  ) {
    setDraftConfig((current) =>
      setReopenOverride(current, date, plantId, slot, reopen),
    );
  }

  function resetSlotCapacity(date: string, plantId: string, slot: string) {
    setDraftConfig((current) =>
      resetSlotCapacities(current, date, plantId, slot),
    );
  }

  function saveDay(date: string) {
    setSavedConfig((current) => copyDateConfig(draftConfig, current, date));
    setSavedDays((current) => ({
      ...current,
      [date]: {
        locked: true,
        savedAt: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    }));
  }

  function editDay(date: string) {
    setSavedDays((current) =>
      current[date]
        ? { ...current, [date]: { ...current[date], locked: false } }
        : current,
    );
  }

  function discardDay(date: string) {
    setDraftConfig((current) => copyDateConfig(savedConfig, current, date));
  }

  return {
    draftConfig,
    savedConfig,
    savedDays,
    changeHourlyDefault,
    changeSlotCapacities,
    changeReopenOverride,
    resetSlotCapacity,
    saveDay,
    editDay,
    discardDay,
  };
}
