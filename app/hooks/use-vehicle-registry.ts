"use client";

import { mockVehicles } from "@/app/data/mocks/vehicles";
import { useRegistryStore } from "@/app/hooks/use-registry-store";
import type { VehicleRecord } from "@/app/types/registry";

export function useVehicleRegistry(actorName: string) {
  const store = useRegistryStore<VehicleRecord>(mockVehicles, [], actorName);
  return {
    vehicles: store.items,
    statusRecords: store.records,
    saveVehicle: store.save,
    changeVehicleStatus: store.changeStatus,
  };
}
