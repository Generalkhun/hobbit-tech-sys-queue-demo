"use client";

import { useCallback, useState } from "react";
import {
  createStatusRecord,
  statusActionTargets,
} from "@/app/data/registry";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  RegistryStatus,
  RegistryStatusAction,
  RegistryStatusRecord,
} from "@/app/types/registry";

/** state กลางของทะเบียนที่มีสถานะ (ผู้ขับ/รถ): upsert และเปลี่ยนสถานะพร้อมประวัติ */
export function useRegistryStore<T extends { id: string; status: RegistryStatus }>(
  initialItems: T[],
  initialRecords: RegistryStatusRecord[],
  actorName: string,
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [records, setRecords] = useState<RegistryStatusRecord[]>(initialRecords);

  const save = useCallback((item: T) => {
    setItems((current) =>
      current.some((existing) => existing.id === item.id)
        ? current.map((existing) => (existing.id === item.id ? item : existing))
        : [item, ...current],
    );
  }, []);

  const changeStatus = useCallback(
    (id: string, action: RegistryStatusAction, value: NoteWithAttachments) => {
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: statusActionTargets[action] } : item,
        ),
      );
      setRecords((current) => [createStatusRecord(id, action, value, actorName), ...current]);
    },
    [actorName],
  );

  return { items, records, save, changeStatus };
}
