"use client";

import { useState } from "react";
import { Modal } from "@/app/components/modal";
import { KgStepper } from "@/app/components/shared/kg-stepper";
import { TabBar } from "@/app/components/shared/tab-bar";
import { Button } from "@/app/components/ui";
import { getGradeColor } from "@/app/data/grade-colors";
import { sumDemand } from "@/app/data/plan-calendar";
import type { DailyDemand, DemandKgByGrade } from "@/app/types/plans";
import type { Plant } from "@/app/types/queue";

/** กำหนดปริมาณเหล็ก (กก.) ที่ต้องการรับของแต่ละโรงงานและเกรดในวันนั้น */
export function DemandDayModal({
  date,
  dateLabel,
  plants,
  gradesByPlant,
  demand,
  readOnly,
  onSave,
  onClose,
}: {
  date: string;
  dateLabel: string;
  plants: Plant[];
  gradesByPlant: Record<string, string[]>;
  demand: DailyDemand;
  readOnly: boolean;
  onSave: (byPlant: Record<string, DemandKgByGrade>) => void;
  onClose: () => void;
}) {
  const [plantId, setPlantId] = useState(plants[0].id);
  const [draft, setDraft] = useState<Record<string, DemandKgByGrade>>(
    Object.fromEntries(
      plants.map((plant) => [
        plant.id,
        Object.fromEntries(
          (gradesByPlant[plant.id] ?? []).map((grade) => [
            grade,
            demand[date]?.[plant.id]?.[grade] ?? 0,
          ]),
        ),
      ]),
    ),
  );
  const grades = gradesByPlant[plantId] ?? [];

  return (
    <Modal
      title={`ปริมาณที่ต้องการรับ ${dateLabel}`}
      subtitle={
        readOnly
          ? "วันนี้ถึงอีก 7 วันข้างหน้าและวันในอดีตแก้ไขไม่ได้ ดูได้อย่างเดียว"
          : "กำหนดปริมาณเหล็กที่ต้องการรับของแต่ละโรงงานและเกรด (กก.)"
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
        <TabBar
          tabs={plants.map((plant) => ({ id: plant.id, label: plant.name }))}
          active={plantId}
          onChange={setPlantId}
        />
        {grades.map((grade) => {
          const color = getGradeColor(grades, grade);
          return (
            <div key={grade} className="flex flex-wrap items-center gap-3">
              <span className={`h-9 w-1.5 shrink-0 rounded ${color.bar}`} />
              <span className="min-w-32 flex-1 text-sm font-medium text-slate-700">{grade}</span>
              <KgStepper
                label={`ปริมาณ ${grade}`}
                value={draft[plantId]?.[grade] ?? 0}
                disabled={readOnly}
                onChange={(kg) =>
                  setDraft((current) => ({
                    ...current,
                    [plantId]: { ...current[plantId], [grade]: kg },
                  }))
                }
              />
            </div>
          );
        })}
        <p className="rounded-xl bg-sys-50 px-4 py-3 text-sm font-semibold text-sys-800">
          รวม {plants.find((plant) => plant.id === plantId)?.name}:{" "}
          {sumDemand(draft[plantId]).toLocaleString("th-TH")} กก.
        </p>
      </div>
    </Modal>
  );
}
