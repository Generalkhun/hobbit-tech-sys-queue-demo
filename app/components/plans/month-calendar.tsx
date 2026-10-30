"use client";

import type { ReactNode } from "react";
import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import { getMonthCells, weekdayLabels } from "@/app/data/plan-calendar";

/** ปฏิทินทั้งเดือน: วันที่ล็อกเป็นสีเทาจาง ๆ เนื้อหาในช่องกำหนดผ่าน renderDay */
export function MonthCalendar({
  year,
  month,
  today,
  isLocked,
  renderDay,
  onMonthChange,
  onSelect,
}: {
  year: number;
  month: number;
  today: string;
  isLocked: (date: string) => boolean;
  renderDay?: (date: string) => ReactNode;
  onMonthChange: (delta: number) => void;
  onSelect: (date: string) => void;
}) {
  const title = new Date(Date.UTC(year, month, 1)).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <button
          type="button"
          aria-label="เดือนก่อนหน้า"
          onClick={() => onMonthChange(-1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Icon name="chevron" size={16} className="rotate-180" />
        </button>
        <h3 className="font-bold text-sys-900">{title}</h3>
        <button
          type="button"
          aria-label="เดือนถัดไป"
          onClick={() => onMonthChange(1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Icon name="chevron" size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-500">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {getMonthCells(year, month).map((cell) => {
          const locked = isLocked(cell.date);
          return (
            <button
              key={cell.date}
              type="button"
              aria-label={`วันที่ ${cell.date}${locked ? " (ดูอย่างเดียว)" : ""}`}
              onClick={() => onSelect(cell.date)}
              className={`min-h-24 border-b border-r border-slate-100 p-2 text-left align-top text-xs transition-colors ${
                locked ? "bg-slate-100/70 text-slate-400" : "bg-white hover:bg-sys-50"
              } ${cell.inMonth ? "" : "opacity-40"}`}
            >
              <span
                className={`font-semibold ${
                  cell.date === today ? "rounded-full bg-sys-600 px-1.5 py-0.5 text-white" : ""
                }`}
              >
                {cell.day}
              </span>
              <div className="mt-1.5">{renderDay?.(cell.date)}</div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
