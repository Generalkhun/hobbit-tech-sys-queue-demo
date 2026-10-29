import type { PlanRow } from "@/app/types/queue";
import {
  formatSlot,
  isSlotInsideWindow,
  overlapsRushHour,
  slotHours,
} from "./slot-time.ts";

export const KG_PER_VEHICLE_FACTOR = 20;

export interface SlotCapacityConfig {
  hourlyDefaults: Record<string, number>;
  slotOverrides: Record<string, Record<string, number>>;
  closures: Record<string, string>;
}

export type GradeCapacities = Record<string, number>;

export type CapacityResolver = (
  plantId: string,
  date: string,
  timeSlot: string,
  grade: string,
) => number;

export const emptyCapacityConfig: SlotCapacityConfig = {
  hourlyDefaults: {},
  slotOverrides: {},
  closures: {},
};

const defaultKey = (date: string, plantId: string) => `${date}|${plantId}`;
const slotKey = (date: string, plantId: string, slot: string) =>
  `${date}|${plantId}|${slot}`;

export function splitEvenly(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const safeTotal = Math.max(0, Math.floor(total));
  const base = Math.floor(safeTotal / parts);
  const remainder = safeTotal % parts;
  return Array.from({ length: parts }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

export function getPlantPlans(plans: PlanRow[], plantId: string) {
  return plans.filter((plan) => plan.plantId === plantId);
}

export function getOpenGrades(plans: PlanRow[], plantId: string, slot: string) {
  return getPlantPlans(plans, plantId)
    .filter((plan) => isSlotInsideWindow(slot, plan.window))
    .map((plan) => plan.grade);
}

export function getHourlyDefault(
  config: SlotCapacityConfig,
  plans: PlanRow[],
  date: string,
  plantId: string,
) {
  const stored = config.hourlyDefaults[defaultKey(date, plantId)];
  if (stored !== undefined) return stored;
  return getPlantPlans(plans, plantId).reduce(
    (sum, plan) => sum + plan.maxVehiclesPerSlot,
    0,
  );
}

export function isSlotClosed(plantId: string, slot: string) {
  return overlapsRushHour(plantId, slot);
}

export function getSlotCapacities(
  config: SlotCapacityConfig,
  plans: PlanRow[],
  date: string,
  plantId: string,
  slot: string,
  options: { ignoreClosure?: boolean } = {},
): GradeCapacities {
  if (isSlotClosed(plantId, slot)) return {};
  if (!options.ignoreClosure && getSlotClosure(config, date, plantId, slot)) {
    return {};
  }
  const grades = getOpenGrades(plans, plantId, slot);
  const shares = splitEvenly(
    getHourlyDefault(config, plans, date, plantId),
    grades.length,
  );
  const overrides = config.slotOverrides[slotKey(date, plantId, slot)] ?? {};
  return Object.fromEntries(
    grades.map((grade, index) => [grade, overrides[grade] ?? shares[index]]),
  );
}

export function getSlotClosure(
  config: SlotCapacityConfig,
  date: string,
  plantId: string,
  slot: string,
): string | undefined {
  return config.closures[slotKey(date, plantId, slot)];
}

export function setSlotClosure(
  config: SlotCapacityConfig,
  date: string,
  plantId: string,
  slot: string,
  reason: string | null,
): SlotCapacityConfig {
  const key = slotKey(date, plantId, slot);
  const { [key]: removed, ...rest } = config.closures;
  void removed;
  return {
    ...config,
    closures: reason === null ? rest : { ...rest, [key]: reason.trim() },
  };
}

export function setHourlyDefault(
  config: SlotCapacityConfig,
  date: string,
  plantId: string,
  value: number,
): SlotCapacityConfig {
  return {
    ...config,
    hourlyDefaults: {
      ...config.hourlyDefaults,
      [defaultKey(date, plantId)]: Math.max(0, Math.floor(value)),
    },
  };
}

export function setSlotCapacities(
  config: SlotCapacityConfig,
  date: string,
  plantId: string,
  slot: string,
  capacities: GradeCapacities,
): SlotCapacityConfig {
  return {
    ...config,
    slotOverrides: {
      ...config.slotOverrides,
      [slotKey(date, plantId, slot)]: Object.fromEntries(
        Object.entries(capacities).map(([grade, value]) => [
          grade,
          Math.max(0, Math.floor(value)),
        ]),
      ),
    },
  };
}

export function resetSlotCapacities(
  config: SlotCapacityConfig,
  date: string,
  plantId: string,
  slot: string,
): SlotCapacityConfig {
  const { [slotKey(date, plantId, slot)]: removed, ...rest } =
    config.slotOverrides;
  void removed;
  return { ...config, slotOverrides: rest };
}

export function hasSlotOverride(
  config: SlotCapacityConfig,
  date: string,
  plantId: string,
  slot: string,
) {
  return config.slotOverrides[slotKey(date, plantId, slot)] !== undefined;
}

export function createCapacityResolver(
  plans: PlanRow[],
  config: SlotCapacityConfig = emptyCapacityConfig,
): CapacityResolver {
  return (plantId, date, timeSlot, grade) =>
    getSlotCapacities(config, plans, date, plantId, timeSlot)[grade] ?? 0;
}

export interface GradeDaySummary {
  grade: string;
  vehicles: number;
  kilograms: number;
}

export function summarizeDay(
  config: SlotCapacityConfig,
  plans: PlanRow[],
  date: string,
  plantId: string,
): GradeDaySummary[] {
  const totals = new Map<string, number>(
    getPlantPlans(plans, plantId).map((plan) => [plan.grade, 0]),
  );
  for (const hour of slotHours) {
    const capacities = getSlotCapacities(
      config,
      plans,
      date,
      plantId,
      formatSlot(hour),
    );
    for (const [grade, vehicles] of Object.entries(capacities)) {
      totals.set(grade, (totals.get(grade) ?? 0) + vehicles);
    }
  }
  return [...totals.entries()].map(([grade, vehicles]) => ({
    grade,
    vehicles,
    kilograms: vehicles * KG_PER_VEHICLE_FACTOR,
  }));
}

function belongsToDate(key: string, date: string) {
  return key.startsWith(`${date}|`);
}

function pickDate<T>(record: Record<string, T>, date: string) {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key]) => belongsToDate(key, date))
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function copyDateConfig(
  source: SlotCapacityConfig,
  target: SlotCapacityConfig,
  date: string,
): SlotCapacityConfig {
  const without = <T>(record: Record<string, T>) =>
    Object.fromEntries(
      Object.entries(record).filter(([key]) => !belongsToDate(key, date)),
    );
  return {
    closures: {
      ...without(target.closures),
      ...pickDate(source.closures, date),
    },
    hourlyDefaults: {
      ...without(target.hourlyDefaults),
      ...pickDate(source.hourlyDefaults, date),
    },
    slotOverrides: {
      ...without(target.slotOverrides),
      ...pickDate(source.slotOverrides, date),
    },
  };
}

export function hasSameDateConfig(
  left: SlotCapacityConfig,
  right: SlotCapacityConfig,
  date: string,
) {
  return (
    JSON.stringify([
      pickDate(left.hourlyDefaults, date),
      pickDate(left.slotOverrides, date),
      pickDate(left.closures, date),
    ]) ===
    JSON.stringify([
      pickDate(right.hourlyDefaults, date),
      pickDate(right.slotOverrides, date),
      pickDate(right.closures, date),
    ])
  );
}
