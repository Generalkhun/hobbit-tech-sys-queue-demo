"use client";

import { useState } from "react";
import { Modal } from "@/app/components/modal";
import { Button, inputClassName } from "@/app/components/ui";
import { getGradeColor } from "@/app/data/grade-colors";
import type { GradeCapacities } from "@/app/data/slot-capacity";

export function SlotCapacityModal({
  slot,
  plantName,
  grades,
  initial,
  booked,
  customized,
  closureReason,
  onSave,
  onReset,
  onClose,
}: {
  slot: string;
  plantName: string;
  grades: string[];
  initial: GradeCapacities;
  booked: Record<string, number>;
  customized: boolean;
  closureReason?: string;
  onSave: (capacities: GradeCapacities, closureReason: string | null) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const openGrades = Object.keys(initial);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      openGrades.map((grade) => [grade, String(initial[grade])]),
    ),
  );

  const [closed, setClosed] = useState(closureReason !== undefined);
  const [reason, setReason] = useState(closureReason ?? "");
  const bookedTotal = Object.values(booked).reduce((sum, count) => sum + count, 0);
  const closureInvalid = closed && reason.trim() === "";

  const parsed = openGrades.map((grade) => {
    const raw = values[grade] ?? "";
    const value = Number(raw);
    const minimum = booked[grade] ?? 0;
    const valid = raw !== "" && Number.isInteger(value) && value >= minimum;
    return { grade, value, minimum, valid };
  });
  const allValid = closed || parsed.every((item) => item.valid);
  const total = parsed.reduce((sum, item) => sum + (item.valid ? item.value : 0), 0);

  return (
    <Modal
      title={`ปรับความจุ ${slot} น.`}
      subtitle={`${plantName} · กำหนดจำนวนรถที่รับได้ของแต่ละเกรด`}
      onClose={onClose}
      footer={
        <>
          {customized && (
            <Button
              variant="quiet"
              className="mr-auto"
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              คืนค่าเริ่มต้น
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            disabled={!allValid || closureInvalid}
            onClick={() =>
              onSave(
                Object.fromEntries(
                  parsed.map((item) => [
                    item.grade,
                    item.valid ? item.value : initial[item.grade],
                  ]),
                ),
                closed ? reason.trim() : null,
              )
            }
          >
            บันทึก
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-rose-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-rose-600"
              checked={closed}
              onChange={(event) => setClosed(event.target.checked)}
            />
            ปิดรับช่วงเวลานี้
          </label>
          {closed && (
            <div className="mt-3">
              <input
                className={inputClassName}
                aria-label="เหตุผลที่ปิดรับ"
                placeholder="เหตุผล เช่น ซ่อมบำรุงเครื่องชั่ง"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              {reason.trim() === "" && (
                <p role="alert" className="mt-1 text-[11px] text-rose-600">
                  กรุณาระบุเหตุผลที่ปิดรับ
                </p>
              )}
              {bookedTotal > 0 && (
                <p role="note" className="mt-1 text-[11px] text-amber-700">
                  ช่วงนี้มีคิวจองแล้ว {bookedTotal} คัน ยังคงอยู่ตามเดิม
                  การปิดรับมีผลกับการจองใหม่เท่านั้น (โยกรถได้ที่หน้าปฏิบัติการ)
                </p>
              )}
            </div>
          )}
        </div>
        {!closed && parsed.map((item) => {
          const color = getGradeColor(grades, item.grade);
          return (
            <div key={item.grade}>
              <label className="flex items-center gap-3">
                <span className={`h-9 w-1.5 shrink-0 rounded ${color.bar}`} />
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {item.grade}
                  {item.minimum > 0 && (
                    <span className="block text-[11px] font-normal text-slate-400">
                      จองแล้ว {item.minimum} คัน
                    </span>
                  )}
                </span>
                <input
                  className={`${inputClassName} w-24 text-right`}
                  type="number"
                  min={item.minimum}
                  step={1}
                  inputMode="numeric"
                  aria-label={`จำนวนรถ ${item.grade}`}
                  value={values[item.grade] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [item.grade]: event.target.value,
                    }))
                  }
                />
                <span className="w-8 text-xs text-slate-400">คัน</span>
              </label>
              {!item.valid && (
                <p role="alert" className="ml-4 mt-1 text-[11px] text-rose-600">
                  ต้องเป็นจำนวนเต็มและไม่น้อยกว่าที่จองแล้ว ({item.minimum} คัน)
                </p>
              )}
            </div>
          );
        })}
        {!closed && (
          <p className="rounded-xl bg-sys-50 px-4 py-3 text-sm font-semibold text-sys-800">
            รวมช่วงนี้ {total} คัน
          </p>
        )}
      </div>
    </Modal>
  );
}
