"use client";

import { useMemo, useState } from "react";
import { CapacitySummary } from "@/app/components/capacity-summary";
import { PlanSaveBar, type PlanSaveStatus } from "@/app/components/plan-save-bar";
import { PlansFilterBar } from "@/app/components/plans-filter-bar";
import { SlotCapacityModal } from "@/app/components/slot-capacity-modal";
import { SlotCalendar } from "@/app/components/slot-calendar";
import type { SavedPlanDay, SlotView } from "@/app/types/plans";
import { demoDate, plants } from "@/app/data/mock-data";
import {
  getHourlyDefault,
  getPlantPlans,
  getSlotCapacities,
  getSlotClosure,
  hasSameDateConfig,
  hasSlotOverride,
  isSlotClosed,
  summarizeDay,
  type GradeCapacities,
  type SlotCapacityConfig,
} from "@/app/data/slot-capacity";
import { formatSlot, slotHours } from "@/app/data/slot-time";
import type { PlanRow, QueueBooking } from "@/app/types/queue";

export function PlansPage({
  plans,
  bookings,
  capacityConfig,
  savedConfig,
  savedDays,
  onSaveDay,
  onEditDay,
  onDiscardDay,
  onHourlyDefaultChange,
  onSlotCapacitiesChange,
  onSlotCapacitiesReset,
}: {
  plans: PlanRow[];
  bookings: QueueBooking[];
  capacityConfig: SlotCapacityConfig;
  savedConfig: SlotCapacityConfig;
  savedDays: Record<string, SavedPlanDay>;
  onSaveDay: (date: string) => void;
  onEditDay: (date: string) => void;
  onDiscardDay: (date: string) => void;
  onHourlyDefaultChange: (date: string, plantId: string, value: number) => void;
  onSlotCapacitiesChange: (
    date: string,
    plantId: string,
    slot: string,
    capacities: GradeCapacities,
    closureReason: string | null,
  ) => void;
  onSlotCapacitiesReset: (date: string, plantId: string, slot: string) => void;
}) {
  const [date, setDate] = useState(demoDate);
  const [plantId, setPlantId] = useState(plants[0].id);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  const plant = plants.find((item) => item.id === plantId) ?? plants[0];
  const grades = useMemo(
    () => getPlantPlans(plans, plantId).map((plan) => plan.grade),
    [plans, plantId],
  );

  const views: SlotView[] = slotHours.map((hour) => {
    const slot = formatSlot(hour);
    const booked: Record<string, number> = {};
    for (const booking of bookings) {
      if (
        booking.plantId === plantId &&
        booking.date === date &&
        booking.timeSlot === slot
      ) {
        booked[booking.grade] = (booked[booking.grade] ?? 0) + 1;
      }
    }
    return {
      slot,
      closedReason: isSlotClosed(plantId, slot)
        ? `ปิดรับ · ช่วง Rush Hour ของ ${plant.name}`
        : undefined,
      manualClosure: getSlotClosure(capacityConfig, date, plantId, slot),
      capacities: getSlotCapacities(capacityConfig, plans, date, plantId, slot, {
        ignoreClosure: true,
      }),
      booked,
      customized: hasSlotOverride(capacityConfig, date, plantId, slot),
    };
  });
  const savedDay = savedDays[date];
  const locked = savedDay?.locked ?? false;
  const dirty = !hasSameDateConfig(capacityConfig, savedConfig, date);
  const status: PlanSaveStatus = dirty
    ? "dirty"
    : savedDay
      ? "saved"
      : "unsaved-default";
  const editingView = views.find((view) => view.slot === editingSlot);

  return (
    <div className="space-y-6">
      <PlansFilterBar
        date={date}
        onDateChange={(value) => {
          setDate(value);
          setEditingSlot(null);
        }}
        minDate={demoDate}
        plants={plants}
        plantId={plantId}
        onPlantChange={(value) => {
          setPlantId(value);
          setEditingSlot(null);
        }}
        disabled={locked}
        hourlyDefault={getHourlyDefault(capacityConfig, plans, date, plantId)}
        onHourlyDefaultChange={(value) =>
          onHourlyDefaultChange(date, plantId, value)
        }
      />
      <PlanSaveBar
        status={status}
        locked={locked}
        savedAt={savedDay?.savedAt}
        dateLabel={new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        onSave={() => {
          setEditingSlot(null);
          onSaveDay(date);
        }}
        onEdit={() => onEditDay(date)}
        onDiscard={() => {
          setEditingSlot(null);
          onDiscardDay(date);
        }}
      />
      <SlotCalendar
        views={views}
        grades={grades}
        onSelect={setEditingSlot}
        readOnly={locked}
      />
      <CapacitySummary
        summary={summarizeDay(capacityConfig, plans, date, plantId)}
        grades={grades}
      />
      {editingView && !locked && (
        <SlotCapacityModal
          key={`${date}|${plantId}|${editingView.slot}`}
          slot={editingView.slot}
          plantName={plant.name}
          grades={grades}
          initial={editingView.capacities}
          booked={editingView.booked}
          customized={editingView.customized}
          onClose={() => setEditingSlot(null)}
          closureReason={editingView.manualClosure}
          onSave={(capacities, closureReason) => {
            onSlotCapacitiesChange(
              date,
              plantId,
              editingView.slot,
              capacities,
              closureReason,
            );
            setEditingSlot(null);
          }}
          onReset={() =>
            onSlotCapacitiesReset(date, plantId, editingView.slot)
          }
        />
      )}
    </div>
  );
}
