"use client";

import { useState } from "react";
import { Modal } from "@/app/components/modal";
import { KgStepper } from "@/app/components/shared/kg-stepper";
import { Button } from "@/app/components/ui";
import { getGradeColor } from "@/app/data/grade-colors";
import { sumDemand } from "@/app/data/plan-calendar";
import type { DailyDemand, DemandKgByGrade } from "@/app/types/plans";

/** กำหนดปริมาณเหล็ก (กก.) ที่ต้องการรับรวมทุกโรงงาน (จศ. พิมพ์ยอดรวม) */
export function DemandDayModal({
  date,
  dateLabel,
  grades,
  demand,
  readOnly,
  onSave,
  onClose,
}: {
  date: string;
  dateLabel: string;
  grades: string[];
  demand: DailyDemand;
  readOnly: boolean;
  onSave: (byGrade: DemandKgByGrade) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<DemandKgByGrade>(
    Object.fromEntries(
      grades.map((grade) => [grade, demand[date]?.[grade] ?? 0]),
    ),
  );

  return (
    <Modal
      title={`ปริมาณที่ต้องการรับ ${dateLabel}`}
      subtitle={
        readOnly
          ? "วันนี้ถึงอีก 7 วันข้างหน้าและวันในอดีตแก้ไขไม่ได้ ดูได้อย่างเดียว"
          : "กำหนดปริมาณเหล็กที่ต้องการรับรวมทุกโรงงาน (กก.)"
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {readOnly ? "ปิด" : "ยกเลิก"}
          </Button>
          {!readOnly && <Button onClick={() => onSave(draft)}>บันทึก</Button>}
        </>
      }
    >
      <div className="space-y-4">
        {grades.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            ยังไม่มีเกรดที่เปิดรับในช่วงนี้
          </p>
        )}
        {grades.map((grade) => {
          const color = getGradeColor(grades, grade);
          return (
            <div key={grade} className="flex flex-wrap items-center gap-3">
              <span className={`h-9 w-1.5 shrink-0 rounded ${color.bar}`} />
              <span className="min-w-32 flex-1 text-sm font-medium text-slate-700">{grade}</span>
              <KgStepper
                label={`ปริมาณ ${grade}`}
                value={draft[grade] ?? 0}
                disabled={readOnly}
                onChange={(kg) =>
                  setDraft((current) => ({ ...current, [grade]: kg }))
                }
              />
            </div>
          );
        })}
        <p className="rounded-xl bg-sys-50 px-4 py-3 text-sm font-semibold text-sys-800">
          รวมทุกโรงงาน: {sumDemand(draft).toLocaleString("th-TH")} กก.
        </p>
      </div>
    </Modal>
  );
}
