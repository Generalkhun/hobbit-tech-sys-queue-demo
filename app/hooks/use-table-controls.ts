"use client";

import { useMemo, useState } from "react";
import { matchesSearch, paginate } from "@/app/data/registry";

/** ค้นหาและแบ่งหน้าสำหรับตารางที่ข้อมูลอยู่ฝั่ง client */
export function useTableControls<T>(
  items: T[],
  getSearchFields: (item: T) => string[],
  pageSize = 8,
) {
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => items.filter((item) => matchesSearch(getSearchFields(item), query)),
    // getSearchFields เป็นฟังก์ชันคงที่ของแต่ละตาราง
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, query],
  );
  const pagination = paginate(filtered, page, pageSize);

  return {
    query,
    setQuery: (value: string) => {
      setQueryState(value);
      setPage(1);
    },
    setPage,
    total: filtered.length,
    ...pagination,
  };
}
