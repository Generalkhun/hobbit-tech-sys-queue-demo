"use client";

import { useCallback, useState } from "react";
import { mockDrivers } from "@/app/data/mock-data";
import type { DriverRecord } from "@/app/types/queue";

export function useDriverRegistry() {
  const [drivers, setDrivers] = useState<DriverRecord[]>(mockDrivers);

  const registerDriver = useCallback((driver: DriverRecord) => {
    setDrivers((current) => [driver, ...current]);
  }, []);

  const updateDriverApproval = useCallback(
    (driverId: string, approved: boolean) => {
      setDrivers((current) =>
        current.map((driver) =>
          driver.id === driverId ? { ...driver, approved } : driver,
        ),
      );
    },
    [],
  );

  return { drivers, registerDriver, updateDriverApproval };
}
