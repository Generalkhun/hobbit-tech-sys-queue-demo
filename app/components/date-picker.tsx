"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { th } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { Icon } from "@/app/components/icons";
import { inputClassName } from "@/app/components/ui";

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = parseIsoDate(value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${inputClassName} flex items-center justify-between gap-3 text-left`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          {selected.toLocaleDateString("th-TH", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <Icon name="calendar" size={16} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl [--rdp-accent-color:var(--color-sys-600)] [--rdp-accent-background-color:var(--color-sys-50)]">
          <DayPicker
            mode="single"
            locale={th}
            selected={selected}
            defaultMonth={selected}
            disabled={min ? { before: parseIsoDate(min) } : undefined}
            onSelect={(date) => {
              if (!date) return;
              onChange(toIsoDate(date));
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
