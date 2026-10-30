"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";

function formatNow() {
  return new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Badge "ข้อมูลอัปเดตล่าสุด" พร้อมเวลาที่อัปเดตและปุ่มรีเฟรช
 * ใช้ซ้ำได้ทุกหน้า — กดรีเฟรชแล้วเวลาจะอัปเดตเป็นปัจจุบัน
 */
export function LastUpdatedBadge({
  className = "",
  onRefresh,
}: {
  className?: string;
  /** callback เพิ่มเติมเมื่อกดรีเฟรช (เช่น ดึงข้อมูลใหม่) */
  onRefresh?: () => void;
}) {
  const [updatedAt, setUpdatedAt] = useState(formatNow);
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setUpdatedAt(formatNow());
      setRefreshing(false);
      onRefresh?.();
    }, 500);
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        ข้อมูลอัปเดตล่าสุด {updatedAt} น.
      </div>
      <button
        type="button"
        aria-label="รีเฟรชข้อมูลล่าสุด"
        onClick={refresh}
        disabled={refreshing}
        className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <Icon
          name="refresh"
          size={14}
          className={refreshing ? "animate-spin" : ""}
        />
      </button>
    </div>
  );
}
