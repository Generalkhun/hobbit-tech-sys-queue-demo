"use client";

import { useState, type ComponentProps } from "react";
import { DemandDayModal } from "@/app/components/plans/demand-day-modal";
import { MonthCalendar } from "@/app/components/plans/month-calendar";
import { PlansPage } from "@/app/components/plans-page";
import { BackLink } from "@/app/components/shared/back-link";
import { TabBar } from "@/app/components/shared/tab-bar";
import { demoDate, plants } from "@/app/data/mock-data";
import {
  isDateLocked,
  shiftMonth,
  sumDayDemand,
} from "@/app/data/plan-calendar";
import { getPlantPlans } from "@/app/data/slot-capacity";
import type { DailyDemand, DemandKgByGrade } from "@/app/types/plans";
import type { UserRole } from "@/app/types/queue";

type PlansTab = "demand" | "slots";

type SlotPlanProps = Omit<ComponentProps<typeof PlansPage>, "date" | "onDateChange" | "readOnly">;

const today = demoDate;
const isLocked = (date: string) => isDateLocked(date, today);

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** หน้าแผนรับเหล็ก: แท็บกำหนดปริมาณต่อวัน (จศ.) และแท็บกำหนดปริมาณรถ (ปศ./จศ.) */
export function PlansLandingPage({
  role,
  demand,
  onSaveDemand,
  slotPlan,
}: {
  role: UserRole;
  demand: DailyDemand;
  onSaveDemand: (date: string, byGrade: DemandKgByGrade) => void;
  slotPlan: SlotPlanProps;
}) {
  const canSetDemand = role === "admin";
  const [tab, setTab] = useState<PlansTab>(canSetDemand ? "demand" : "slots");
  const [cursor, setCursor] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)) - 1,
  }));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const tabs = [
    ...(canSetDemand ? [{ id: "demand" as const, label: "กำหนดปริมาณที่ต้องการให้รับในแต่ละวัน" }] : []),
    { id: "slots" as const, label: "กำหนดปริมาณรถที่เข้ามาส่งได้ในแต่ละวัน" },
  ];

  function changeTab(next: PlansTab) {
    setTab(next);
    setSelectedDate(null);
  }

  if (tab === "slots" && selectedDate) {
    return (
      <div className="space-y-5">
        <BackLink label="กลับไปปฏิทิน" onClick={() => setSelectedDate(null)} />
        <PlansPage
          {...slotPlan}
          date={selectedDate}
          onDateChange={setSelectedDate}
          readOnly={isLocked(selectedDate)}
        />
      </div>
    );
  }

  const gradesByPlant = Object.fromEntries(
    plants.map((plant) => [
      plant.id,
      getPlantPlans(slotPlan.plans, plant.id).map((plan) => plan.grade),
    ]),
  );
  const allGrades = [...new Set(Object.values(gradesByPlant).flat())];

  return (
    <div className="space-y-5">
      <TabBar tabs={tabs} active={tab} onChange={changeTab} />
      <MonthCalendar
        year={cursor.year}
        month={cursor.month}
        today={today}
        isLocked={isLocked}
        isPlanned={(date) =>
          tab === "demand"
            ? sumDayDemand(demand, date) > 0
            : Boolean(slotPlan.savedDays[date])
        }
        onMonthChange={(delta) => setCursor((c) => shiftMonth(c.year, c.month, delta))}
        onSelect={setSelectedDate}
        renderDay={(date) =>
          tab === "demand" ? (
            sumDayDemand(demand, date) > 0 && (
              <span className="text-[11px] font-semibold text-sys-700">
                {sumDayDemand(demand, date).toLocaleString("th-TH")} กก.
              </span>
            )
          ) : (
            slotPlan.savedDays[date] && (
              <span className="text-[11px] font-semibold text-emerald-700">บันทึกแผนแล้ว</span>
            )
          )
        }
      />
      {tab === "demand" && selectedDate && (
        <DemandDayModal
          key={selectedDate}
          date={selectedDate}
          dateLabel={formatDate(selectedDate)}
          grades={allGrades}
          demand={demand}
          readOnly={isLocked(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSave={(byGrade) => {
            onSaveDemand(selectedDate, byGrade);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}
