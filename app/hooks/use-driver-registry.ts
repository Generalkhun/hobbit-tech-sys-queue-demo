"use client";

import { mockDriverStatusRecords, mockDrivers } from "@/app/data/mocks/drivers";
import { useRegistryStore } from "@/app/hooks/use-registry-store";
import type { DriverRecord } from "@/app/types/registry";

export function useDriverRegistry(actorName: string) {
  const store = useRegistryStore<DriverRecord>(mockDrivers, mockDriverStatusRecords, actorName);
  return {
    drivers: store.items,
    statusRecords: store.records,
    saveDriver: store.save,
    changeDriverStatus: store.changeStatus,
  };
}
